const express = require(`express`);

const {check, body} = require(`express-validator`)

const authController = require('../controllers/auth');

const User = require('../models/user');

const isAuth = require(`../middleware/isAuth`);

const router = express.Router();

router.get(`/users`, isAuth, authController.getUsers);

router.get(`/login`, authController.getLogin);
router.post(
   '/login',
   [
     body('email')
       .isEmail()
       .withMessage('Please enter a valid email address.')
       .normalizeEmail(),
     body('password', 'Password has to be valid.')
       .isLength({ min: 5 })
       .isAlphanumeric()
       .trim()
   ],
   authController.postLogin
 );

router.post(`/logout`, authController.postLogout);

router.get('/signup', authController.getSignup);

router.post('/signup',
[
  body('email')
  .isEmail()
  .withMessage('Please enter a valid email.')
  .custom((value, { req }) => {
     // Возвращаем промис из findOne
     return User.findOne({ where: { email: value}})
       .then(userDoc => {
         if (userDoc) {
           // Если пользователь существует, бросаем ошибку
           throw new Error('E-Mail exists already, please pick a different one.');
         }
         // Если пользователь не существует, возвращаем true
         return true;
       });
  })
  .normalizeEmail(),
   body(
     'password',
     'Please enter a password with only numbers and text and at least 5 characters.'
   )
     .isLength({ min: 5 })
     .isAlphanumeric()
     .trim(),
   body('confirmPassword')
   .custom((value, { req }) => {
     if (value !== req.body.password) {
       throw new Error('Passwords have to match!');
     }
     return true;
   })
   .trim()
 ],
authController.postSignup);

module.exports = router;