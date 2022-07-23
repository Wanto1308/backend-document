import { Sequelize } from 'sequelize';
import db from '../config/Database.js';

const { DataTypes } = Sequelize;

const DataDocument = db.define('data_document', {
  fileId: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  class: { type: DataTypes.STRING },
  description: { type: DataTypes.STRING },
  fileUrl: { type: DataTypes.STRING },
  iconUrl: { type: DataTypes.STRING },
  teacherName: { type: DataTypes.STRING },
  title: { type: DataTypes.STRING },
  userId: { type: DataTypes.STRING }
}, {
  freezeTableName: true
});

export default DataDocument;
