const Sequelize = require(`sequelize`);
const sequelize = require(`../util/database`);

const Zagotovka = sequelize.define('zagotovka', {
   
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    width: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
    },
    height: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
    },
    quantity: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    description: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

module.exports = Zagotovka;
