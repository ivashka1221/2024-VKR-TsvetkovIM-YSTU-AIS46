const path = require('path');

const express = require('express');

const shopController = require('../controllers/shop');

const isAuth = require(`../middleware/isAuth`);

const router = express.Router();

//GET
router.get('/cart', isAuth,shopController.getCart);
router.get('/orders', isAuth,shopController.getOrders);
router.get(`/orders/:orderId`, isAuth,shopController.getOrder);
router.get('/order-master', isAuth,shopController.getOrderMaster);
router.get('/cut/:orderId', isAuth,shopController.getCut);
router.get('/statist', isAuth,shopController.getStat);
router.get(`/order-finish/:orderId`, isAuth,shopController.getOrderFinish);

//POST
router.post(`/create-order`, isAuth, shopController.postOrder);
router.post(`/create-order-brack`, isAuth, shopController.postOrderBrack);
router.post(`/create-order-master`, isAuth, shopController.postOrderMaster);
router.post(`/cut`, isAuth, shopController.postCut);
router.post(`/orders-delete`,isAuth, shopController.postDeleteOrder);


module.exports = router;
