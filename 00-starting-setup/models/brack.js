const Sequelize = require(`sequelize`);
const sequelize = require(`../util/database`);

const Brack  =sequelize.define(`brack`, {
   id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
   },
   quantity: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
});
module.exports = Brack;