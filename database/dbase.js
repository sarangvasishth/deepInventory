const mysql = require("mysql");

const dbase = mysql.createPool({
  connectionLimit: 1000,
  database: process.env.DATABASE,
  port: process.env.DATABASE_PORT,
  user: process.env.DATABASE_USER,
  host: process.env.DATABASE_HOST,
  password: process.env.DATABASE_PASSWORD,
});

dbase.getConnection((error, connection) => {
  if (error) {
    if (connection) connection.release();
    console.error(`${error.message}`.red);
  } else {
    console.log(`${connection.state}`.green);
  }
});

module.exports = dbase;
