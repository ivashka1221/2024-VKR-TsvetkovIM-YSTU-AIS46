const Material = require('../models/material');
const Cart = require('../models/cart');
const Order = require('../models/order');
const CartItem = require('../models/cart-item');
const User = require('../models/user');
const OrderItem = require('../models/order-item');
const OrderMaster = require(`../models/order-master`);
const { where } = require('sequelize');
const Zagotovka = require('../models/zagotovca');
const Ostatoc = require('../models/ostatoc');
const Brack = require('../models/brack');
const TelegramBot = require('node-telegram-bot-api');



exports.getCart = async (req, res, next) => {
  try {
    // Найти корзину пользователя
    const cart = await req.user.getCart();
  
    // Найти элементы корзины для данной корзины
    const cartItems = await CartItem.findAll({ where: { cartId: cart.id }});

    if (!cartItems) { //
      // Если продукты не найдены, вернуть пустую корзину
      return res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        editing:false,
        products: [],
        //isRole: req.session.Role,
        err: false,
        errorMessage: false
      });
    }

    // Получить данные о продуктах для элементов корзины
    const productIds = cartItems.map(cartItem => cartItem.zagotovkaId);

    const products = await Zagotovka.findAll({ where: { id: productIds }, raw: true });
  
    // Обновить данные о продуктах с информацией о количестве в корзине
    const updatedProducts = products.map(product => ({
      id: product.id,
      width: product.width,
      height: product.height,
      quantity: product.quantity
    }));

    // Отобразить страницу корзины с обновленными данными о продуктах
    res.render('shop/cart', {
      path: '/cart',
      pageTitle: 'Your Cart',
      editing:false,
      products: updatedProducts,
      //isRole: req.session.Role,
      err: false,
      errorMessage: false
    });
  } catch (err) {
    next(err);
  }
};

exports.getOrders = async (req, res, next) => {
  try {

    const orders = await Order.findAll();
  
    if (!orders) { 
      // Если продукты не найдены, вернуть пустую корзину
      return res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: [],
        isRole: req.session.Role
      });
    }
    
    const updatedOrders = orders.map(order => ({
      id: order.dataValues.id,
      create: order.createdAt,
      update: order.updatedAt,
      status: order.status,
      type: order.type,
      userId: order.userId
    }));   


    // Рендерим страницу заказов и передаем полученные данные
    res.render('shop/orders', {
      path: '/orders',
      pageTitle: 'Your Orders',
      orders: updatedOrders
    });
  } catch (err) {
    console.error('Error:', err);
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};


exports.postOrder = async (req,res, next) => {
  try{

    // Найти корзину пользователя
    const cart = await req.user.getCart();
    const type = req.body.type;
  
    // Найти элементы корзины для данной корзины
    const cartItems = await CartItem.findAll({ where: { cartId: cart.id }});

    if (cartItems.length === 0) { 
      //Если продукты не найдены, вернуть пустую корзину
      return res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        editing:false,
        products: [],
        err: true,
        errorMessage : `Добавьте заготовки`
      });
    }

    const Order = await req.user.createOrder(({
      type: type
    }));

    cartItems.forEach(cartItem => {
          return  Zagotovka.findByPk(cartItem.dataValues.zagotovkaId)
          .then(Material => {
              OrderItem.create({
                orderId: Order.id,
                zagotovkaId: Material.id
              })
          })
          .catch(err =>{
            console.error('Error:', err);
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
          })
      }
    );

    await cartItems.forEach(cartItem => {
      cartItem.destroy();
    })
    // Вставьте сюда свой токен бота, который вы получили от BotFather
      const token = '7174769574:AAFq8CqHKAk3kibIOOtjrxLZQZMvmRyptpM';
      const bot = new TelegramBot(token, {polling: true});
      const messageText = `Ваш заказ успешно добавлен. Его номер: ${Order.id}, статус ${Order.status}.`;
      bot.sendMessage(`890140922`, messageText)
      .then(() => {
        console.log('Сообщение успешно отправлено');
        // Остановка поллинга
        bot.stopPolling();
      })
      .catch((error) => {
        console.error('Ошибка при отправке сообщения:', error);
      });
    
    res.redirect(`/orders`);

  } catch (err) {
    return next(err);
  }
};

exports.postDeleteOrder = async (req, res, next) => {
  try {
    
    const orderId = req.body.orderId;

    const order = await Order.findByPk(orderId);

    const orderItems = await OrderItem.findAll({ where: {orderId: orderId}});

    const materialId = await orderItems.map( orderItem => orderItem.dataValues.zagotovkaId);

    const materials = await Zagotovka.findAll({where:{id: materialId}});

    
    if(orderItems.length > 0){
      await orderItems.forEach(orderItem => {
        orderItem.destroy();
      })
    }
    if(materials.length > 0){
    await materials.forEach(material => {
      material.destroy();
    })
    }
    await order.destroy();

    const token = '7174769574:AAFq8CqHKAk3kibIOOtjrxLZQZMvmRyptpM';
      const bot = new TelegramBot(token, {polling: true});
      const messageText = `Ваш заказ с номером ${orderId} успешно удален.`;
      bot.sendMessage(`890140922`, messageText)
      .then(() => {
        console.log('Сообщение успешно отправлено');
        // Остановка поллинга
        bot.stopPolling();
      })
      .catch((error) => {
        console.error('Ошибка при отправке сообщения:', error);
      });

    res.redirect('/orders');
    
  } catch (err) {
    console.error('Error:', err);
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};


exports.getOrder = async (req, res, next) => {
  try {
    const orderId = req.params.orderId;

    const order = await Order.findAll({ where: {id: orderId}});    

    const orderItems = await OrderItem.findAll({ where: {orderId: orderId}});

    const materialId = await orderItems.map( orderItem => orderItem.dataValues.zagotovkaId);

    const materials = await Zagotovka.findAll({where:{id: materialId}});

    const materialUpdate = await materials.map( material => ({
      width: material.dataValues.width,
      height: material.dataValues.height,
      quantity: material.dataValues.quantity,
      description: material.dataValues.description
    }));
    console.log(order[0].dataValues);

    res.render(`shop/order-detail`, {
      pageTitle: `Order Detail`,
      path: `/order-detail`,
      materials: materialUpdate,
      type: order[0].dataValues.type
    });
  } catch (err) {
    console.error('Error:', err);
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};


exports.getOrderMaster = async (req, res, next) => {
  try {

    const orderMasters = await OrderMaster.findAll({where:{userId: req.user.id}});
    console.log(orderMasters);

    const orderId = orderMasters.map(orderMaster => orderMaster.dataValues.orderId)

    const orders = await Order.findAll({ where: { id: orderId }});

    if (!orders) { 
      // Если продукты не найдены, вернуть пустую корзину
      return res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: [],
        //isRole: req.session.Role
      });
    }
    
    const updatedOrders = orders.map(order => ({
      id: order.dataValues.id,
      status: order.dataValues.status,
    }));   

    // Рендерим страницу заказов и передаем полученные данные
    res.render('shop/order-master', {
      path: '/order-master',
      pageTitle: 'Master Orders',
      orders: updatedOrders
    })
  } catch (err) {
    console.error('Error:', err);
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }

}

exports.postOrderMaster = async (req, res, next) => {
  try{
    const orderId = req.body.orderId;

    const user = req.user;
    
    const order = await Order.findByPk(orderId);

    await Order.update({ status: `Обрабатывается` }, { where: { id: order.id }});

    await OrderMaster.create({
      userId: user.id, 
      orderId: order.id 
    });

    const token = '7174769574:AAFq8CqHKAk3kibIOOtjrxLZQZMvmRyptpM';
      const bot = new TelegramBot(token, {polling: true});
      const messageText = `Ваш заказ с номером ${orderId} принят в работу мастер ${user.firstName}`;
      bot.sendMessage(`890140922`, messageText)
      .then(() => {
        console.log('Сообщение успешно отправлено');
        // Остановка поллинга
        bot.stopPolling();
      })
      .catch((error) => {
        console.error('Ошибка при отправке сообщения:', error);
      });

    res.redirect(`/order-master`)


  } catch (err){
    console.log(err)
  }
};

//---
Packer = function(w, h) {
  this.init(w, h);
};

Packer.prototype = {

  init: function(w, h) {
    this.root = { x: 0, y: 0, w: w, h: h };
  },

  fit: function(blocks) {
    var n, node, block;
    for (n = 0; n < blocks.length; n++) {
      block = blocks[n];
      if (node = this.findNode(this.root, block.w, block.h))
        block.fit = this.splitNode(node, block.w, block.h);
    }
    return blocks; // Возвращаем измененный массив blocks
  },

  findNode: function(root, w, h) {
    if (root.used)
      return this.findNode(root.right, w, h) || this.findNode(root.down, w, h);
    else if ((w <= root.w) && (h <= root.h))
      return root;
    else
      return null;
  },

  splitNode: function(node, w, h) {
    node.used = true;
    node.down  = { x: node.x,     y: node.y + h, w: node.w,     h: node.h - h };
    node.right = { x: node.x + w, y: node.y,     w: node.w - w, h: h          };
    return node;
  }

}
//---

exports.postCut = async (req, res, next) => {
  try{
  const orderMasterId = req.body.orderMaster;
  const width = req.body.width;
  const height = req.body.height;

  const userId = req.user.id;

  const orderMasters = await OrderMaster.findByPk(orderMasterId);

  const orderId = orderMasters.orderId;

  const orderItems = await OrderItem.findAll({ where: {orderId: orderId}});

  const materialId = await orderItems.map( orderItem => orderItem.dataValues.zagotovkaId);

  const materials = await Zagotovka.findAll({where:{id: materialId}});

  const materialUpdate = await materials.map( material => ({
      width: material.dataValues.width,
      height: material.dataValues.height,
      quantity: material.dataValues.quantity,
    }));

  // Упорядочиваем массив по убыванию значения ширины (width)
  const sortedByWidth = [...materialUpdate].sort((a, b) => b.width - a.width);

  var newArrayWidth = sortedByWidth.reduce((acc, { width, height, quantity }) => {
    for (let i = 0; i < quantity; i++) {
      acc.push({width: width, height: height});
    }
    return acc;
  }, []);

  // Упорядочиваем массив по убыванию значения высоты (height)
  const sortedByHeight = [...materialUpdate].sort((a, b) => b.height - a.height);

  var newArrayHeight = sortedByHeight.reduce((acc, { width, height, quantity }) => {
    for (let i = 0; i < quantity; i++) {
      acc.push({w: width, h: height});
    }
    return acc;
  }, []);

  console.log(`newArrayHeight`);
  console.log(newArrayHeight);

  
  // -----
  var main = [{
    width: parseInt(width),
    height: parseInt(height),
    count: 0
  }]
  var fittedBlocksAllIterations = [];
  var index = 0;

  while (newArrayHeight.length > 0) { // Пока массив не пуст

        index = index + 1;
        main[0].count = index; 

        var fittedBlocksIteration = []; // Массив для хранения данных об упакованных прямоугольниках в текущей итерации

        var packer = new Packer(parseInt(width),parseInt(height));

        // Выполняем упаковку прямоугольников
  var fittedBlocks = packer.fit(newArrayHeight);

  console.log(`fittedBlocks`);
  console.log(fittedBlocks);

  // Создаем массив с данными о прямоугольниках
  const rectanglesData = fittedBlocks.map((block, index) => {
    if (block.fit) {
      fittedBlocksIteration.push({
        x: block.fit.x,
        y: block.fit.y,
        w: block.w,
        h: block.h
      });

      return {
        iteration: index,
        x: block.fit.x,
        y: block.fit.y,
        w: block.w,
        h: block.h
      };
    }
  });

  // Добавляем данные об упакованных прямоугольниках текущей итерации в массив для всех итераций
  fittedBlocksAllIterations.push(fittedBlocksIteration);

  console.log("Данные о прямоугольниках в текущей итерации:");
  console.log(rectanglesData);

  // Обновляем массив newArrayHeight, удаляя уже использованные прямоугольники
  newArrayHeight = newArrayHeight.filter(block => !block.fit);
}

console.log("Данные об упакованных прямоугольниках во всех итерациях:");
console.log(fittedBlocksAllIterations);

// Создаем массив с произведениями w * h для каждого элемента
const areas = newArrayHeight.map(item => item.w * item.h);

// Находим сумму всех произведений
const totalArea = areas.reduce((acc, area) => acc + area, 0);

var ostatoc1 = width * height * main[0].count - totalArea;

const material = await Material.create({ 
  width: width,
  height: height,
  quantity: main[0].count,
  description: ``,
  orderMasterId: orderMasterId
});
const ostatoc = await Ostatoc.create({ 
  quantity: ostatoc1,
  orderMasterId: orderMasterId
});
        
  //----

  res.render('shop/cut-detail', {
    path: '/cut-detail',
    pageTitle: 'Cut Detail',
    cuts: fittedBlocksAllIterations,
    main: main,
    orderMasterId: orderMasterId
  })
} catch (err) {
  console.log(err)
}
};

exports.getCut = async (req, res, next) => {
  try{
    const orderId = req.params.orderId;

    const orderMasters = await OrderMaster.findAll({where:{orderId: orderId}});

    const orderMasterUpdate = await orderMasters.map( orderMaster => ({
      id: orderMaster.dataValues.id,
      userId: orderMaster.dataValues.userId,
      orderId: orderMaster.dataValues.orderId
    }));

    const orderItems = await OrderItem.findAll({ where: {orderId: orderId}});

    const materialId = await orderItems.map( orderItem => orderItem.dataValues.zagotovkaId);

    const materials = await Zagotovka.findAll({where:{id: materialId}});

    const materialUpdate = await materials.map( material => ({
      width: material.dataValues.width,
      height: material.dataValues.height,
      quantity: material.dataValues.quantity,
      description: material.dataValues.description
    }));

    res.render(`shop/cut`, {
      pageTitle: `Cut`,
      path: `/cut`,
      materials: materialUpdate,
      orderMaster: orderMasterUpdate[0]
    });


  } catch (err){
    console.log(err);
  }
}

exports.getStat = async (req, res, next) => {
  try{
    const rul = `http://localhost:3000/public/dashboard/548c5a92-b3a4-4a0e-9f2e-9ca8ed6283ef`;
    res.render(`shop/statist`, {
      pageTitle: `Статистика`,
      path: `/stat`,
      url: rul
    });

  } catch (err){
    console.log(err);
  }
}

exports.getOrderFinish = async (req, res, next) => {
  try{
    
    const orderId = req.params.orderId;

    await Order.update({ status: `Выполнен` }, { where: { id: orderId }});

    const token = '7174769574:AAFq8CqHKAk3kibIOOtjrxLZQZMvmRyptpM';
      const bot = new TelegramBot(token, {polling: true});
      const messageText = `Ваш заказ с номером ${orderId} выролнен.`;
      bot.sendMessage(`890140922`, messageText)
      .then(() => {
        console.log('Сообщение успешно отправлено');
        // Остановка поллинга
        bot.stopPolling();
      })
      .catch((error) => {
        console.error('Ошибка при отправке сообщения:', error);
      });

      res.redirect(`/order-master`)

  } catch (err){
    console.log(err);
  }
}

exports.postOrderBrack = async (req, res, next) => {
  try{
    const width = req.body.width;
    const height = req.body.height;
    const quantity = req.body.quantity * width * height / 1000000;
    const orderMasterId = req.body.orderMasterId;

    await Brack.create({
      quantity: quantity, 
      orderMasterId:orderMasterId
    });
    res.redirect(`/order-master`)

  } catch (err){
    console.log(err)
  }
};
