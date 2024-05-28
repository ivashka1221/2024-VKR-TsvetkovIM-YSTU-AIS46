const Material = require('../models/material');
const User = require('../models/user');
const Zagotovca = require(`../models/zagotovca`);
const CartItem = require(`../models/cart-item`);
const Zagotovka = require('../models/zagotovca');
//const CartItem = require(`./models/cart-item`);


exports.postAddProductCart = async (req, res, next) => {
  const width = req.body.width;
  const height = req.body.height;
  const quantity = req.body.quantity;
  const description = req.body.description;

  try {
    const userId = req.user.id;
    const material = await Zagotovca.create({ 
      width: width,
      height: height,
      quantity: quantity,
      description: description,
      userId: userId
    });
    const idMaterial = material.id;
    const cart = await req.user.getCart();
    const idCart = cart.id;
    console.log(idCart);
    const cartItem = await CartItem.create({
      cartId: idCart,
      zagotovkaId: idMaterial
    });
    console.log(cartItem);
    res.redirect(`/cart`);
  } catch (err) {
    console.error('Error:', err);
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postDeleteProductCart = async (req, res, next) => {
  try {
    const productId = req.body.productId;

    const cart = await req.user.getCart();
    const products = await cart.getZagotovkas({ where: { id: productId } });

    await products[0].cartItem.destroy();

    await products[0].destroy();

    res.redirect('/cart');
    
  } catch (err) {
    console.error('Error:', err);
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getEditProduct = async (req, res, next) => {
  try {
    const editMode = req.query.edit; // true
    
    if(!editMode){
      return res.redirect(`/cart`);
    }
    const materialId = req.params.productId;
    
    const materials = await Zagotovka.findAll({where:{id: materialId}});

    const materialUpdate = await materials.map( material => ({
      id: material.dataValues.id,
      width: material.dataValues.width,
      height: material.dataValues.height,
      quantity: material.dataValues.quantity,
      description: material.dataValues.description
    }));

    console.log(materialUpdate[0].width)

    res.render('shop/cart', {
          pageTitle: 'Edit Product',
          path: '/shop/cart',
          editing: editMode,
          products: materialUpdate,
          err: false,
          errorMessage: false
      });

  } catch (err) {
    console.error('Error:', err);
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postEditProduct = async (req, res, next) => {

  const materialId = req.body.materialId;
  const Upwidth = req.body.width;
  const Upheight = req.body.height;
  const Upquantity = req.body.quantity;
  const Updescription = req.body.description;

  const material = await Zagotovca.findByPk(materialId);
    try{
      if (!material) {
        const error = new Error('Product not found');
        error.httpStatusCode = 404;
        throw error;
      }
      
      material.width = Upwidth,
      material.height = Upheight,
      material.quantity = Upquantity,
      material.description = Updescription
      
      await material.save();

      res.redirect(`/cart`)
    } catch (err) {
      console.error('Error:', err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    }
}
