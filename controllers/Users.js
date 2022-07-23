import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import path from "path";
import Users from '../models/UserModel.js';
import nodemailer from "nodemailer";

const smtpTransport = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "econfirm1308@gmail.com",
    pass: "amibyisilzfevxwa"
  }
});

export const getUsers = async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const { id, fullName, email } = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const accessToken = jwt.sign({ id, fullName, email }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: '1d'
    });
    const users = await Users.findOne({
      where: {
        id
      },
      attributes: ['id', 'userName', 'fullName', 'email', 'mobileNumber', 'imageProfile', 'role', 'createdAt', 'updatedAt']
    });
    const dataUser = { user: users, accessToken, expiredAt: '1d' };
    const data = { code: 200, data: dataUser, message: 'Berhasil mengambil data' };
    res.json(data);
  } catch (error) {
    console.log(error);
  }
};

export const updateUsers = async (req, res) => {
  const { userName, fullName, email, mobileNumber } = req.body;
  const randomName = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const users = await Users.findOne({
    where: {
      id: req.params.id
    }
  });
  if (!users) return res.status(404).json({ message: "Data tidak ditemukan" });

  let fileName = "";
  if (req.files === null) {
    fileName = users.image;
  } else {
    const file = req.files.imageProfile;
    const fileSize = file.data.length;
    const ext = path.extname(file.name);
    fileName = randomName + ext;
    const allowedType = ['.png', '.jpg', '.jpeg'];

    if (!allowedType.includes(ext.toLowerCase())) return res.status(422).json({ message: "Invalid Images" });
    if (fileSize > 5000000) return res.status(422).json({ message: "Image must be less than 5 MB" });

    file.mv(`./public/images/${fileName}`, (err) => {
      if (err) return res.status(500).json({ msg: err.message });
    });
  }
  const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;

  try {
    await Users.update({
      userName,
      fullName,
      email,
      mobileNumber,
      imageProfile: url
    }, {
      where: {
        id: req.params.id
      }
    });
    res.status(200).json({ message: "Berhasil mengubah data" });
  } catch (error) {
    console.log(error.message);
  }
}

export const register = async (req, res) => {
  const { userName, fullName, email, mobileNumber, password, confPassword } = req.body;
  if (password !== confPassword) { return res.status(400).json({ message: 'Password dan Confirm Password tidak cocok' }); }

  const salt = bcrypt.genSaltSync();
  const hashPassword = await bcrypt.hash(password, salt);

  try {
    const user = await Users.findAll({
      where: {
        email: email
      }
    });

    if (user.length !== 0) {
      if (email === user[0].email) { return res.status(400).json({ message: 'Email sudah terdaftar!' }); }
    }

    await Users.create({
      userName: userName,
      fullName: fullName,
      email: email,
      mobileNumber: mobileNumber,
      role: 'user',
      password: hashPassword
    });
    return res.json({ message: 'Register Berhasil' });
  } catch (error) {
    res.status(404).json({ message: 'Register gagal!' });
  }
};

export const login = async (req, res) => {
  try {
    const user = await Users.findAll({
      where: {
        email: req.body.email
      }
    });
    const match = await bcrypt.compare(req.body.password, user[0].password);
    if (!match) { return res.status(400).json({ message: 'Password Salah' }); }
    const { id, userName, fullName, email, mobileNumber, role, imageProfile } = user[0];
    const accessToken = jwt.sign({ id, fullName, email }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: '1d'
    });
    const dataUser = { user: { id, userName, fullName, email, mobileNumber, imageProfile, role }, accessToken, expiredAt: '1d' };
    const dataLogin = { code: 200, data: dataUser, message: 'Berhasil mengambil data' };
    res.json(dataLogin);
  } catch (error) {
    res.status(404).json({ message: 'Email tidak ditemukan' });
  }
};

export const updatePassword = async (req, res) => {
  const { password, newPassword, confNewPassword } = req.body;
  if (newPassword !== confNewPassword) { return res.status(400).json({ message: 'Password Baru dan Confirm Password Baru tidak cocok' }); }
  const salt = bcrypt.genSaltSync();
  const hashPassword = await bcrypt.hash(newPassword, salt);

  try {
    const user = await Users.findOne({
      where: {
        id: req.params.id
      },
      attributes: ['password']
    });
    const match = await bcrypt.compare(password, user.password);
    if (!match) { return res.status(400).json({ message: { password: 'Password Lama yang anda masukkan salah!' } }); }

    await Users.update({
      password: hashPassword
    }, {
      where: {
        id: req.params.id
      }
    });
    res.status(200).json({ message: "Berhasil mengubah password" });
  } catch (error) {
    console.log(error.message);
  }
}

export const resetPassword = async (req, res) => {
  const randomPassword = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  const { id } = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  const salt = bcrypt.genSaltSync();
  const hashPassword = await bcrypt.hash(randomPassword, salt);

  try {
    const user = await Users.findOne({
      where: {
        id
      },
      attributes: ['email', 'fullName']
    });
    const mailOptions = {
      from: "Admin Bot",
      to: user.email,
      subject: "Reset Password",
      html: `Hallo ${user.fullName},<br><br> Anda telah melakukan reset password
      , berikut ini adalah password Anda yang baru: <b>${randomPassword}</b> <br><br> Terimakasih`
    };
    smtpTransport.sendMail(mailOptions, function (error, response) {
      if (error) {
        res.status(400).json({
          code: 400,
          success: false,
          sendResetPassword: false,
          message: "Reset password gagal dan Email reset password gagal terkirim. Silahkan periksa koneksi internet Anda"
        }).end();
      } else {
        Users.update({
          password: hashPassword
        }, {
          where: { id }
        });
        res.status(200).json({
          code: 200,
          success: true,
          sendResetPassword: true,
          message: "Reset password berhasil dan Email reset password berhasil terkirim"
        }).end();
      }
    })
  } catch (error) {
    res.status(404).json({ message: "Reset password gagal!" });
  }
}
