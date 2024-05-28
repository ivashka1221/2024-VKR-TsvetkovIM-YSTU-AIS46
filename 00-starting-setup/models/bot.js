const Sequelize = require(`sequelize`);
const sequelize = require(`../util/database`);

const Bot = sequelize.define('bot', {
   
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    key: {
      type: Sequelize.STRING,
      allowNull: false
  }
});

module.exports = Bot;
