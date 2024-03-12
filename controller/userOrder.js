const userSchema = require("../models/userSchema");
const orderModal = require('../models/orders')
const categoryModal = require('../models/catagory')
const addressModal = require('../models/adress')
const cartModal = require('../models/cart')
const productModal = require('../models/products');
const invoiceConfig = require('../config/invoice')
require('dotenv').config();
const fs = require('fs');
const path = require('path')
const { v4: uuid } = require('uuid')
const wallet = require('../models/wallet');
const coupenSchema = require("../models/coupen");
const coupenId = require('../config/coupenId')
const instance = require('../config/razorpay')

// checkoutPage page rendering
const checkoutPage = async (req, res) => {
    try {
        const cetgory = await categoryModal.find({})
        const coupenOffer = req.session.offer || 0;
        const user = await userSchema.findOne({ _id: req.session.login })
        const cart = await cartModal.findOne({ userId: req.session.login }).populate('products.productId');
        const nonBlockedProduct = cart.products.filter((e) => e.productId.status)
        const BlockedProduct = cart.products.filter((e) => !e.productId.status)
        for (const el of BlockedProduct) {
            if (!el.productId.status) {

                const doc = await cartModal.findOneAndUpdate({ userId: req.session.login }, { $pull: { products: { productId: el.productId._id } } }, { new: true });
            }
        }
        const total1 = nonBlockedProduct.reduce((acc, product) => acc + product.price, 0);
        const total = Number(total1.toFixed(1))
        const wallet1 = await wallet.findOne({ userId: req.session.login })
        const walletAmount = wallet1?.amount || 0;
        const adress = await addressModal.findOne({ userId: req.session.login })
        const totalPriceAdding = await cartModal.findOneAndUpdate({ userId: req.session.login }, { $set: { TotalPrice: total } }, { new: true }).populate('products.productId').exec()

        if (adress) {
            const add = adress?.address.find(e => e._id + 'hh' == user.addressId + 'hh');
            res.render('client/checkout', { login: req.session.login, add, cart: totalPriceAdding, walletAmount, coupenOffer, cetgory })
        } else {
            res.render('client/checkout', { login: req.session.login, cart: totalPriceAdding, walletAmount, coupenOffer, cetgory })

        }



    } catch (err) {
        console.log(err.message + '     checkoutPage page rendiering route')
    }
}


//succes msg rendering
const success = async (req, res) => {
    try {
        const cetgory = await categoryModal.find({})
        if (req.session.succes) {
            delete req.session.succes;

            res.render('client/succes', { login: req.session.login, cetgory })
        } else {
            res.redirect('/order')
        }
    } catch (err) {
        console.log(err.message + '   succes page rendering')
    }
}

//razor
const razor = async (req, res) => {
    try {
        const user = await userSchema.findOne({ _id: req.body.userId })
        const amount = req.body.amount * 100
        const options = {
            amount: amount,
            currency: "INR",
            receipt: 'absharameen625@gmail.com'
        }
        instance.orders.create(options, (err, order) => {
            if (!err) {
                res.send({
                    succes: true,
                    msg: 'ORDER created',
                    order_id: order.id,
                    amount: amount,
                    key_id: process.env.RAZORPAY_IDKEY,
                    name: user.name,
                    email: user.email
                })
            } else {
                console.error("Error creating order:", err);
                res.status(500).send({ success: false, msg: "Failed to create order" });
            }
        })
    } catch (err) {
        console.log(err.message + '     razor')
    }
}

//postSucces
const postSucces = async (req, res) => {
    try {
        const offer = req.session.offer || 0;
        const user = await userSchema.findOne({ _id: req.session.login })
        const cart = await cartModal.findOne({ userId: req.session.login })
        const subtotal = cart.TotalPrice / 100 * (100 - offer)
        const orderAmount = subtotal.toFixed(1)
        const orderSet = await orderModal.create({
            userId: req.session.login,
            orderAmount: orderAmount,
            offer: offer,
            deliveryAdress: user.addressId,
            peyment: req.body.peyment,
            deliveryAdress: {
                name: req.body.name,
                city: req.body.city,
                state: req.body.state,
                pincode: req.body.pincode,
            },
            orderDate: new Date(),
            OrderedItems: cart.products.map(e => ({
                productId: e.productId,
                quantity: e.quantity,
                price: e.price,
            })),
        })
        if (req.session.offer && req.session.coupenId) {

            const hh = req.session.coupenId.trim()
            const id = String(hh)
            const coupenRemove = await userSchema.findOneAndUpdate({ _id: user._id }, { $pull: { coupens: { ID: id } } })

        }
        if (req.body.peyment == 'wallet') {
            const ne = 0 - subtotal.toFixed(1)
            const debitAMount = ne * (-1)
            await wallet.findOneAndUpdate({ userId: req.session.login }, { $inc: { amount: ne }, $push: { transaction: { amount: debitAMount, creditOrDebit: 'debit' } } })
        }
        if (orderSet) {
            orderSet.OrderedItems.forEach(async (e) => {
                let product = await productModal.findOne({ _id: e.productId })
                let newstock = product.stock - e.quantity
                let pr = await productModal.findOneAndUpdate({ _id: e.productId }, { $set: { stock: newstock } })
            })

            const removeCart = await cartModal.updateOne(
                { userId: req.session.login },
                { $unset: { products: 1 } }
            );

            const coupen = await coupenSchema.find({
                from: { $lte: cart.TotalPrice },
                to: { $gte: cart.TotalPrice }
            });
            if (coupen.length !== 0) {
                for (const e of coupen) {
                    let id = coupenId.generateRandomId()
                    let flag = 0;
                    while (flag == 1) {

                        let data = await userSchema.findOne({
                            _id: req.session.login,
                            "coupens.ID": id
                        });
                        if (!data) {

                            flag = 1
                        } else {
                            id = coupenId.generateRandomId()
                        }
                    }

                    const coupenSet = await userSchema.findOneAndUpdate(
                        { _id: req.session.login },
                        {
                            $push: {
                                coupens: {
                                    ID: id,
                                    coupenId: e._id
                                }
                            }
                        }
                    );

                }

            }
            if (removeCart) {

                req.session.succes = true
                res.redirect('/success')

            } else {
                res.send('its fucked up')
            }
        } else {
            res.send('irs note')
        }
    } catch (err) {
        console.log(err.message + '    postSucces')
    }
}

//order det page rendering
const orderDet = async (req, res) => {
    try {

        const perPage = 5;
        const page = req.query.page || 1;
        const cetgory = await categoryModal.find({})
        const order = await orderModal.find({ userId: req.session.login }).skip((perPage * page) - perPage)
            .limit(perPage).sort({_id:-1})

        if (order.length !== 0) {

        }
        const le = await orderModal.find({ userId: req.session.login });
        const gg = Math.ceil(le.length / 5)
        if (order.length != 0 && gg < page) {
            console.log(order + 'sasghagfshja')
            res.redirect(`/order`)
        }
        if (order) {
            let order1 = order.reverse()
            res.render('client/orderDet', { login: req.session.login, order: order1, cetgory, le: le.length, gg, now: page })
        } else {
            res.render('client/orderDet', { login: req.session.login, cetgory, le: le.length, gg, now: page })
        }


    } catch (err) {
        console.log(err.message + '     order det pag erendering ')
    }
}


// order view details page 
const orderView = async (req, res) => {
    try {
        const cetgory = await categoryModal.find({})
        const order = await orderModal.findOne({ _id: req.params.id }).populate('OrderedItems.productId')
        res.render('client/order', { login: req.session.login, order, cetgory })
    } catch (err) {
        console.log(err.message + '      ORDER VIEW PAGE RENDERING ')
    }
}

//editOrder
const editOrder = async (req, res) => {
    try {
        const newOne = await orderModal.findOneAndUpdate({ _id: req.body.orderId, 'OrderedItems.productId': req.body.id },
            {
                $set: {
                    'OrderedItems.$.canceled': true,
                    'OrderedItems.$.orderProStatus': 'canceled'
                }
            },
            {
                new: true
            }
        )
        if (newOne) {

            if (newOne.OrderedItems.length == 1) {
                const k = await orderModal.findOneAndUpdate({ _id: newOne._id }, { $set: { orderStatus: 'canceled' } })

            } else {
                let flag = newOne.OrderedItems.filter(e => e.orderProStatus === 'canceled').length;
                if (flag === newOne.OrderedItems.length) {
                    const k = await orderModal.findOneAndUpdate({ _id: newOne._id }, { $set: { orderStatus: 'canceled' } })

                }
            }
            if (newOne.peyment != 'cod') {
                await wallet.findOneAndUpdate({ userId: req.body.user }, { $inc: { amount: req.body.price }, $push: { transaction: { amount: req.body.price, creditOrDebit: 'credit' } } }, { new: true, upsert: true });
            }

            res.send({ set: true })
        } else {
            res.send({ issue: true })

        }
    } catch (err) {
        console.log(err.message + ' /editOrder')
    }
}

//invoice
const invoice = async (req, res) => {
    try {
        if (req.params.id) {
            const uuidb = uuid()
            const orderDta = await orderModal.findOne({ _id: req.params.id }).populate('OrderedItems.productId userId')
            const inv = invoiceConfig(orderDta)
            const result = await easyinvoice.createInvoice(inv);
            const filePath = path.join(__dirname, '../public/files', `invoice_${uuidb}.pdf`);
            await fs.writeFileSync(filePath, result.pdf, 'base64');
            res.download(filePath, `invoice_${uuidb}.pdf`, (err) => {

                if (!err) {
                    fs.unlinkSync(filePath);

                } else {
                    console.error(err);
                }
            });
        } else {
            res.status(404).send('Invoice ID not provided');
        }

    } catch (err) {
        console.log(err + '     invoice')
    }
}

const walletHistory = async (req, res) => {
    try {
        const perPage = 5;
        const page = req.query.page || 1;
        const walletOld = await wallet.find({ userId: req.session.login }).skip((perPage * page) - perPage)
            .limit(perPage);;

        const le = await wallet.find({ userId: req.session.login });
        const gg = Math.ceil(le.length / 5)
        if (walletOld.length != 0 && gg < page) {
            console.log(walletOld + 'sasghagfshja')
            res.redirect(`/walletHistory`)
        }
        const cetgory = await categoryModal.find({})
        const walletData = await wallet.findOne({ userId: req.session.login }) || []
        res.render('client/walletHistory', { login: req.session.login, cetgory, wallet: walletData, le: le.length, gg, now: page })
    } catch (err) {
        console.log(err.message + 'gvsjhgagsjhaf')
        res.status(400).send({ err: err.message })
    }
}

module.exports = {
    checkoutPage,
    success,
    postSucces,
    orderDet,
    orderView,
    editOrder,
    razor,
    invoice,
    walletHistory
}