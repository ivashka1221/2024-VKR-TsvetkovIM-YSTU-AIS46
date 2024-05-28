const Sequelize = require(`sequelize`);
const sequelize = require(`../util/database`);

const Cut = sequelize.define('cut', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
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
  status: {
    type: Sequelize.ENUM('Новый', 'Обрабатывается', 'Выполнен', `Отменен`),
   defaultValue: 'Новый'
 }
}, 
);

// Экспорт модели
module.exports = Cut;
