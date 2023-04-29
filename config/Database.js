import { Sequelize } from 'sequelize';

// const db = new Sequelize('document', 'root', '', {
//   host: 'localhost',
//   dialect: "mysql"
// });

const db = new Sequelize('myar9880_arsip', 'myar9880_iman', 'imanueltoing', {
  host: 'srv79.niagahoster.com',
  dialect: 'mysql'
});

export default db;
