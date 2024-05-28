const bcrypt = require('bcryptjs');

const { validationResult } = require(`express-validator`);

const User = require('../models/user');

exports.getLogin = (req, res, next) => {
   let message = req.flash(`error`);
   if(message.length > 0){
      message = message[0];
   } else {
      message = null
   }
   console.log(message);
   console.log(req.flash(`error`))
     res.render('auth/login', {
       pageTitle: 'Login',
       path: '/login',
       errorMassage: message,
       oldInput: {
         email: '',
         password: ''
       },
       validationErrors: req.flash(`error`)
      })
 };

 exports.postLogin = (req, res, next) => {
   const email = req.body.email;
   const password = req.body.password;

   const errors = validationResult(req);
   console.log(errors)
   if(!errors.isEmpty()){
      console.log(errors.array()[0].msg)
      return res.status(422).render('auth/login', {
         path: '/login',
         pageTitle: 'Login',
         errorMassage: errors.array()[0].msg,
         oldInput: {
            email: email,
            password: password 
          },
          validationErrors: errors.array()
       }) 
   } 
    User.findAll({ where: { email: email}})
    .then(user => {
      if(user.length === 0){
         req.flash(`error`, `Invalid email or password.`);
         return res.redirect(`/login`)
      }
      bcrypt
      .compare(password, user[0].dataValues.password)
      .then(doMatch => {
         if(doMatch){
            req.session.isLoggerIn = true;
            req.session.isRole = user[0].dataValues.role;
            req.session.user = user;
            req.session.userId = user[0].dataValues.id;
            return req.session.save(err => {
               res.redirect(`/orders`);
            });
         }
          req.flash('error', 'Invalid email or password.');
          res.redirect('/login');
      })
      .catch(err => {
         console.log(err);
         res.redirect(`/login`);
      });
   })
   .catch(err => console.log(err));
};

 exports.getSignup = (req, res, next) => {
   let message = req.flash('error');
   if (message.length > 0) {
    message = message[0];
   } else {
    message = null;
   }
   res.render('auth/signup', {
     path: '/signup',
     pageTitle: 'Signup',
     errorMassage: message,
    oldInput: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '' 
    },
    validationErrors: []
   });
 };

 exports.postSignup = (req, res, next) => {
   const firstName = req.body.firstName;
   const lastName = req.body.lastName;
   const email = req.body.email;
   const password = req.body.password;
   const confirmPassword = req.body.confirmPassword; 
   const registrationDate = new Date();
   const role = req.body.role;
   console.log(firstName,lastName);

   const errors = validationResult(req);
   
   if(!errors.isEmpty()){
         return res.status(422).render('auth/signup', {
            path: '/signup',
            pageTitle: 'Signup',
            errorMassage: errors.array()[0].msg,
            oldInput: {
               firstName: firstName,
               lastName: lastName,
               email: email,
               password: password,
               confirmPassword: req.body.confirmPassword
         },
         validationErrors: errors.array()
      })
   }
   
   // Проверяем, существует ли пользователь с таким email
   User.findOne({ where: { email: email}})
     .then(userDoc => {  
         // Если пользователь существует, перенаправляем на страницу входа
         if (userDoc) {
            req.flash(`error`, `Пользователь существует.`);
            return res.redirect('/login');
         }
         
         // Проверяем совпадение паролей
         if (password !== confirmPassword) {
            req.flash(`error`, `Пароли не совпадают.`);
            // Выводим сообщение об ошибке и перенаправляем на страницу регистрации
            return res.redirect('/signup');
         }
         
         // Создаем нового пользователя
         return bcrypt.hash(password, 12)
            .then(hashedPassword => {
               // Создаем нового пользователя с хэшированным паролем
               return User.create({
                  firstName: firstName,
                  lastName: lastName,
                  email: email,
                  password: hashedPassword,
                  role: role,
                  registrationDate: registrationDate
               });
            })
            .then(user => {
               // Создаем корзину для пользователя
               return user.createCart();
            })
            .then(result => {
               // После успешного создания пользователя и корзины перенаправляем на страницу входа
               res.redirect('/signup');
            });
     })
     .catch(err => {
         // Обрабатываем возможные ошибки
         console.log(err);
         res.redirect('/signup');
     }); 
};  

exports.postLogout = (req, res, next) => {
   req.session.isLoggerIn = false;
   req.session.isRole = false;
   req.session.userId = false;

   req.session.destroy(err => {
      console.log(err);
      res.redirect(`/login`);
   });
};

exports.getUsers = async (req, res, next) => {
   try {
 
     const users = await User.findAll();

     function formatDate(dateString) {
      const date = new Date(dateString);
      const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'};
      return date.toLocaleDateString('ru-RU', options);
    }

     const updatedUsers = users.map(user => ({
       id: user.id,
       firstName: user.firstName,
       lastName: user.lastName,
       email: user.email,
       password: user.password,
       role: user.role,
       registrationDate: formatDate(user.registrationDate)
     }));   

 
     // Рендерим страницу заказов и передаем полученные данные
     res.render('auth/users', {
       path: '/users',
       pageTitle: 'Все пользователи',
       updateUsers: updatedUsers
     });
   } catch (err) {
     console.error('Error:', err);
     const error = new Error(err);
     error.httpStatusCode = 500;
     return next(error);
   }
 };
