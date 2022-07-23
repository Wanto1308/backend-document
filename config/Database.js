import { Sequelize } from 'sequelize';

const db = new Sequelize('document', 'root', '', {
  host: 'localhost',
  dialect: 'mysql'
});

export default db;
