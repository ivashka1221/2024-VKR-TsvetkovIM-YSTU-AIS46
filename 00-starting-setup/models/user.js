const Sequelize = require(`sequelize`);
const sequelize = require(`../util/database`);

const User = sequelize.define(`user`, {
   id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    // Имя пользователя
    firstName: {
      type: Sequelize.STRING,
      allowNull: false
    },
    // Фамилия пользователя
    lastName: {
      type: Sequelize.STRING,
      allowNull: false
    },
    // Электронная почта (уникальное значение)
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    // Пароль пользователя
    password: {
      type: Sequelize.STRING,
      allowNull: false
    },
    // Роль пользователя (например, администратор, менеджер и т. д.)
    role: {
      type: Sequelize.ENUM('Администратор', 'Продавец', 'Мастер'),
      defaultValue: 'Администратор'
    },
    // Дата регистрации пользователя (автоматически заполняется текущей датой при создании)
    registrationDate: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    }
});

module.exports = User;