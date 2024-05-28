const Sequelize = require("sequelize");
const sequelize = new Sequelize("shop", "root1", "root1", {
  dialect: "mssql",
  host: "localhost",
  port: "1433",
  storage: "./session.mssql"
});

module.exports = sequelize;