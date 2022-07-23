import Sqz from 'sequelize';
import db from '../config/Database.js';

const { Sequelize } = Sqz;
const { DataTypes } = Sequelize;

const Users = db.define('users', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  userName: {
    type: DataTypes.STRING
  },
  fullName: {
    type: DataTypes.STRING
  },
  email: {
    type: DataTypes.STRING
  },
  mobileNumber: {
    type: DataTypes.STRING
  },
  imageProfile: {
    type: DataTypes.STRING
  },
  role: {
    type: DataTypes.STRING
  },
  password: {
    type: DataTypes.STRING
  }
}, {
  freezeTableName: true
});

export default Users;
