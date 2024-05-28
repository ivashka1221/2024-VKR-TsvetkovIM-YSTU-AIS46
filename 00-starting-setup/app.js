const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');

const sequelize = require(`./util/database`);

const session = require("express-session");

const csrf = require(`csurf`);

const flash = require(`connect-flash`)

const SequelizeStore = require("connect-session-sequelize")(session.Store);

const Zagotovca = require(`./models/zagotovca`);
const User = require(`./models/user`);
const Ostatoc = require(`./models/ostatoc`);
const Order = require(`./models/order`);
const OrderMaster = require(`./models/order-master`);
const OrderItem = require(`./models/order-item`);
const Material = require(`./models/material`);
const Cut = require(`./models/cut`);
const Cart = require(`./models/cart`);
const CartItem = require(`./models/cart-item`);
const Brack = require(`./models/brack`);
const Bot = require(`./models/bot`);

const errorController = require('./controllers/error');

const app = express();

const csrfProtection = csrf();
app.use(flash());

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const { error } = require('console');
const { where } = require('sequelize');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
   session({
     secret: "my secret",
     store: new SequelizeStore({
       db: sequelize,
     }),
     resave: false, 
     saveUninitialized:false
   })
 );

 app.use(csrfProtection);

 app.use((req,res, next) => {
   if(!req.session.user){
      return next()
   }
   User.findByPk(req.session.user[0].id)
   .then(user => {
      if(!user){
         return next();
      }
      req.user = user;
      next()
   })
   .catch(err => {
      throw new Error(err);
   })
 });

app.use( (req,res,next) => {
   res.locals.isRole = req.session.isRole;
   res.locals.isAuthenticated = req.session.isLoggerIn;
   res.locals.csrfToken = req.csrfToken();
   res.locals.userId = req.session.userId;
   next();
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(errorController.get404);

app.use((error, req, res, next) => {

   const status = error.status || 500; // Используйте статус из ошибки или статус 500 по умолчанию
   const errorMessage = error.message || 'Internal Server Error'; // Используйте сообщение из ошибки или сообщение по умолчанию

   res.status(status).render('err', {
    pageTitle: 'Error',
    path: `/error/${status}`,
    isAuthenticated: req.session.isLoggerIn,
    isRole: req.session.Role,
    errorMessage: errorMessage
   });
})

Zagotovca.belongsTo(User);
User.hasMany(Zagotovca);
////
Cart.belongsTo(User);
User.hasOne(Cart);

Cart.belongsToMany(Zagotovca, { through: CartItem});
Zagotovca.belongsToMany(Cart, { through: CartItem});
// ////
Order.belongsTo(User);
User.hasMany(Order);

Order.belongsToMany(Zagotovca, { through: OrderItem});
Zagotovca.belongsToMany(Order, { through: OrderItem});
// ///
//User.belongsToMany(Order, {through:OrderMaster});
OrderMaster.belongsTo(User);
User.hasMany(OrderMaster);
OrderMaster.belongsTo(Order);
Order.hasMany(OrderMaster);
Material.belongsTo(OrderMaster);
OrderMaster.hasMany(Material);
Ostatoc.belongsTo(OrderMaster);
OrderMaster.hasMany(Ostatoc);
Brack.belongsTo(OrderMaster);
OrderMaster.hasMany(Brack);
Bot.belongsTo(User);
User.hasOne(Bot);


sequelize
//.sync({force: true})
.sync()
.then(bd => {
   const user = User.findAll({where:{id: 1}})
   return user
   .then(user => {
      console.log(user.length);
      if(user.length === 0){
      return bcrypt.hash(`1234admin`, 12)
            .then(hashedPassword => {
               // Создаем нового пользователя с хэшированным паролем
               return User.create({
                  firstName: `Администратор`,
                  lastName: `Администратор`,
                  email: `admin@admin.admin`,
                  password: hashedPassword,
                  role: `Администратор`,
                  registrationDate: new Date()
               });
            })
            .then(user => {
               // Создаем корзину для пользователя
               return user.createCart();
            })
   }
   })
})
.then(()=> {
   app.listen(5000);
})
.catch(err => {
   console.log(err);
})


