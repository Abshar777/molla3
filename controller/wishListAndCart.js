const categoryModal = require('../models/catagory')
const cartModal = require('../models/cart')
const productModal = require('../models/products');
const wishListModal = require('../models/wishList')
require('dotenv').config();


//cart 
const cart = async (req, res) => {
    try {
        const cetgory = await categoryModal.find({})
        const cart = await cartModal.findOne({ userId: req.session.login }).populate('products.productId');

        if (cart) {
            const nonBlockedProduct = cart.products.filter((e) => e.productId.status)
            const BlockedProduct = cart.products.filter((e) => !e.productId.status)
            for (const el of BlockedProduct) {
                if (!el.productId.status) {

                    const doc = await cartModal.findOneAndUpdate({ userId: req.session.login }, { $pull: { products: { productId: el.productId._id } } }, { new: true });
                }
            }
            const total1 = nonBlockedProduct.reduce((acc, product) => acc + product.price, 0);
            const total = Number(total1.toFixed(1))
            const options = {
                upsert: true,
                new: true,
            };
            const totalPriceAdding = await cartModal.findOneAndUpdate({ userId: req.session.login }, { $set: { TotalPrice: total } }, options).exec()
            const msg = req.flash('msg')
            res.render('client/cart', { cart, login: req.session.login, totalprice: totalPriceAdding.TotalPrice, msg, cetgory })
        } else {
            const msg = req.flash('msg')
            res.render('client/cart', { login: req.session.login, totalprice: 0, msg, cetgory })
        }


    } catch (err) {
        console.log(err.message + '      cart page route')
    }
}

//wishlist 
const wishlist = async (req, res) => {
    try {
        const cetgory = await categoryModal.find({})
        const wishlist = await wishListModal.findOne({ userId: req.session.login }).populate('products.productId')
        res.render('client/wishlist', { wishlist, login: req.session.login, cetgory })

    } catch (err) {
        console.log(err.message + '      wishList page route')
    }
}

//wishListAdd
const wishListAdd = async (req, res) => {
    try {
        const result = await wishListModal.findOne({
            userId: req.query.user,
            products: {
                $elemMatch: {
                    productId: req.query.id
                }
            }
        }).exec();
        if (!result) {
            const filter = { userId: req.query.user };
            const update = {
                $set: {
                    userId: req.query.user,

                },
                $addToSet: {
                    products: { productId: req.query.id, },
                },
            };
            const options = {
                upsert: true,
                new: true,
            };

            const cartSuccess = await wishListModal.findOneAndUpdate(filter, update, options).exec();
            res.status(200).json({ success: true })

        } else {

            res.status(200).json({ exist: true })
        }



    } catch (err) {
        res.status(500).send(err.message + 'wishListAdd')
    }
}

//wishlist remove 
const wishListRemove = async (req, res) => {
    try {
        const remove = await wishListModal.updateOne({ userId: req.query.user }, { $pull: { products: { productId: req.query.proid } } })
        res.status(200).json({ set: true })
    } catch (err) {
        res.status(400).send(err.message + ' wishlist remve')
    }
}

// add cart fetching 
const addcart = async (req, res) => {
    try {
        const product = await productModal.findOne({ _id: req.body.id })
        const remove = await wishListModal.updateOne({ userId: req.body.user }, { $pull: { products: { productId: req.body.id } } })
        const result = await cartModal.findOne({
            userId: req.body.user,
            products: {
                $elemMatch: {
                    productId: req.body.id
                }
            }
        }).exec();
        if (!result) {

            const tp = product.price * req.body.q;

            const filter = { userId: req.body.user };
            const update = {
                $set: {
                    userId: req.body.user,

                },
                $addToSet: {
                    products: { productId: req.body.id, price: tp },
                },
            };
            const options = {
                upsert: true,
                new: true,
            };

            const cartSuccess = await cartModal.findOneAndUpdate(filter, update, options).exec();

            if (cartSuccess) {
                res.send({ success: "succes" })
            }
        } else {
            res.send({ exist: 'it is already exist' })
        }


    } catch (err) {
        console.log(err.message + '      addCart put fecth routre')
    }
}

//cartCount
const cartCount = async (req, res) => {
    try {
        const cart = await cartModal.findOne({ userId: req.session.login }) || null
        const wishlist = await wishListModal.findOne({ userId: req.session.login }) || null

        res.status(200).send({ cart: cart?.products?.length || 0, wishlist: wishlist?.products?.length || 0 })
    } catch (err) {
        res.status(500).send(err.message + '   cartCount')
    }
}

// add cart on post requiset
const addcartPost = async (req, res) => {
    try {
        if (req.query.user) {
            const product = await productModal.findOne({ _id: req.query.id })
            const remove = await wishListModal.updateOne({ userId: req.query.user }, { $pull: { products: { productId: req.query.id } } })

            const result = await cartModal.findOne({
                userId: req.query.user,
                products: {
                    $elemMatch: {
                        productId: req.query.id
                    }
                }
            }).exec();

            if (!result) {
                const tp = product.price * req.body.q;

                const filter = { userId: req.query.user };
                const update = {
                    $set: {
                        userId: req.query.user,

                    },
                    $addToSet: {
                        products: { productId: req.query.id, price: tp, quantity: req.body.q },
                    },
                };
                const options = {
                    upsert: true,
                    new: true,
                };

                const cartSuccess = await cartModal.findOneAndUpdate(filter, update, options).exec();

                if (cartSuccess) {
                    res.redirect(`/cart?id=${req.query.user}`)
                }
            } else {
                const tp = product.price * req.body.q;
                const updatedCart = await cartModal.findOneAndUpdate(
                    { userId: req.query.user, 'products.productId': req.query.id },
                    {
                        $set: {
                            'products.$.price': tp,
                            'products.$.quantity': req.body.q
                        }
                    },
                    { new: true }
                );
                if (updatedCart) {

                    res.redirect(`/cart?id=${req.query.user}`)
                } else {
                    res.send('somthing oissues')
                }
            }
        } else {
            res.redirect('/login')
        }


    } catch (err) {
        console.log(err.message + '    addcartpost route')
    }
}

//edit cart fetch 
const cartEdit = async (req, res) => {
    try {
        const product = await productModal.findOne({ _id: req.body.i });
        const newval1 = product.price * req.body.quantity;
        const newval = Number(newval1.toFixed(1))
        const updatedCart = await cartModal.findOneAndUpdate(
            { _id: req.body.id, 'products.productId': req.body.i },
            {
                $set: {
                    'products.$.price': newval,
                    'products.$.quantity': req.body.quantity
                }
            },
            { new: true }
        );

        const total1 = updatedCart.products.reduce((acc, product) => acc + product.price, 0);
        const total = Number(total1.toFixed(1))
        await cartModal.findOneAndUpdate(
            { _id: req.body.id },
            { $set: { TotalPrice: total } }
        );

        res.send({ su: total });


    } catch (err) {
        console.log(err.message + '   cart edit ')
    }
}

//cart remove
const cartree = async (req, res) => {
    try {
        const oldCart=await cartModal.findOne({_id: req.body.id});
        const total=oldCart.TotalPrice-req.body.prize
        const NewCart = await cartModal.findOneAndUpdate({ _id: req.body.id }, { $set: { TotalPrice: total }, $pull: { products: { productId: req.body.proid } } },{new:true})
       res.status(200).send({NewCart})

    } catch (err) {
        console.log(err.message + '   catrreeee')
    }
}

module.exports = {
    cart,
    wishlist,
    addcart,
    cartEdit,
    cartree,
    addcartPost,
    wishListAdd,
    wishListRemove,
    cartCount,
}