import { Sequelize } from 'sequelize';

const db = new Sequelize('sql6508243', 'sql6508243', 'tyriC4bWcY', {
  host: 'sql6.freemysqlhosting.net',
  dialect: 'mysql'
});

export default db;
