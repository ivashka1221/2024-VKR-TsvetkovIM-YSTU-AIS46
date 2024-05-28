const express = require('express');

const adminController = require('../controllers/admin');

const isAuth = require(`../middleware/isAuth`);

const router = express.Router();

//GET

// POST
router.post('/add-product-cart',isAuth, adminController.postAddProductCart);

router.post(`/cart-delete-item-material`,isAuth, adminController.postDeleteProductCart);

//demo

router.get(`/edit-product/:productId`, isAuth, adminController.getEditProduct);

router.post(`/edit-product`,isAuth,adminController.postEditProduct);


module.exports = router;
