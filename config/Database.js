import { Sequelize } from 'sequelize';

const db = new Sequelize('2aZMBvPUBE', '2aZMBvPUBE', '3eydo9Qkru', {
  host: 'remotemysql.com',
  dialect: 'mysql'
});

// const db = new Sequelize('arsipfil_upload_db', 'arsipfil_arsip-file', 'Imanuel123456', {
//   host: 'catelyn.id.rapidplex.com',
//   dialect: 'mysql'
// });

export default db;
