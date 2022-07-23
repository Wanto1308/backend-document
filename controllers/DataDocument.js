import { Op } from 'sequelize';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from "fs";
import DataDocument from '../models/DataDocumentModel.js';
import Users from '../models/UserModel.js';

const getPagination = (page, size) => {
  const limit = size ? + size : 10;
  const offset = page ? (page - 1) * limit : 0;
  return { limit, offset };
};
const getPagingData = (response, isPage, limit) => {
  const { count: totalItems, rows: data } = response;
  const page = isPage ? + isPage : 1;
  const totalPages = Math.ceil(totalItems / limit);
  const meta = { page, limit, totalPages, totalItems };
  return { code: 200, data, meta, message: 'Berhasil mengambil data' };
};

export const getDocuments = async (req, res) => {
  const { page, limit: size, search } = req.query;
  const condition = search ? { title: { [Op.like]: `%${search}%` } } : null;
  const { limit, offset } = getPagination(page, size);

  try {
    const response = await DataDocument.findAndCountAll({
      where: condition, limit, offset, order: [['updatedAt', 'ASC']],
      attributes: [['fileId', 'id'], 'class', 'description', 'fileUrl', 'iconUrl', 'teacherName', 'title', 'createdAt', 'updatedAt'],
    });
    const data = getPagingData(response, page, limit);
    res.json(data);
  } catch (error) {
    console.log(error);
  }
};

export const saveDocuments = (req, res) => {
  if (req.files === null) { return res.status(400).json({ message: 'No File Uploaded' }); }
  const randomName = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const { isClass, description, title, teacherName } = req.body;
  const file = req.files.file;
  const fileSize = file.data.length;
  const ext = path.extname(file.name);
  const fileName = randomName + ext;
  const url = `${req.protocol}://${req.get('host')}/files/${fileName}`;
  const iconUrl = `${req.protocol}://${req.get('host')}/icons/ic-document-pdf.jpg`;

  if ((ext.toLowerCase()) !== '.pdf') { return res.status(422).json({ message: 'Invalid File PDF' }); }
  if (fileSize > 5000000) { return res.status(422).json({ message: 'Image must be less than 5 MB' }); }

  file.mv(`./public/files/${fileName}`, async (err) => {
    if (err) { return res.status(500).json({ msg: err.message }); }
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      const { id } = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const users = await Users.findOne({
        where: {
          id
        },
        attributes: ['id']
      });

      await DataDocument.create({
        class: isClass, iconUrl, description,
        teacherName, title, fileUrl: url, userId: users.id
      });
      res.status(201).json({ message: 'Data berhasil ditambahkan' });
    } catch (error) {
      console.log(error.message);
    }
  });
};

export const updateDocuments = async (req, res) => {
  const { title, isClass, description } = req.body;
  const randomName = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  const { id } = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

  const document = await DataDocument.findOne({
    where: {
      fileId: req.params.id
    }
  });
  if (!document) return res.status(404).json({ message: "Data tidak ditemukan" });

  let fileName = "";
  if (req.files === null) {
    fileName = document.fileUrl;
  } else {
    const file = req.files.file;
    const fileSize = file.data.length;
    const ext = path.extname(file.name);
    fileName = randomName + ext;

    if ((ext.toLowerCase()) !== '.pdf') return res.status(422).json({ message: "Invalid File PDF" });
    if (fileSize > 5000000) return res.status(422).json({ message: "Image must be less than 5 MB" });

    file.mv(`./public/files/${fileName}`, (err) => {
      if (err) return res.status(500).json({ msg: err.message });
    });
  }
  const url = `${req.protocol}://${req.get("host")}/files/${fileName}`;

  try {
    const users = await Users.findOne({
      where: {
        id
      },
      attributes: ['role']
    });
    if (users.role === 'user') { return res.status(400).json({ message: 'Anda tidak memiliki hak Akses untuk mengubah data!' }); }
  
    await DataDocument.update({
      title,
      class: isClass,
      description,
      fileUrl: url
    }, {
      where: {
        fileId: req.params.id
      }
    });
    res.status(200).json({ message: "Berhasil mengubah data" });
  } catch (error) {
    console.log(error.message);
  }
}

export const deleteDocuments = async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  const { id } = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

  const document = await DataDocument.findOne({
    where: {
      fileId: req.params.id
    }
  });
  if (!document) return res.status(404).json({ message: "Data tidak ditemukan" });
  const fileName = document.fileUrl.split('/')[4];

  try {
    const users = await Users.findOne({
      where: {
        id
      },
      attributes: ['role']
    });
    if (users.role === 'user') { return res.status(400).json({ message: 'Anda tidak memiliki hak Akses untuk menghapus data!' }); }

    const filepath = `./public/files/${fileName}`;
    fs.unlinkSync(filepath);
    await DataDocument.destroy({
      where: {
        fileId: req.params.id
      }
    });
    res.status(200).json({ message: "Berhasil menghapus data" });
  } catch (error) {
    console.log(error.message);
  }
}
