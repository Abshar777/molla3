const userSchema = require("../models/userSchema");
const offerSchema = require("../models/offer");
const categoryModal = require('../models/catagory')
const productModal = require('../models/products');
const coupenId = require('../config/coupenId')
const path = require('path');
const fs = require('fs');
const pdf = require('html-pdf');
const { v4: uuid } = require('uuid')
const ejs = require('ejs');
const orderModal = require('../models/orders')
const addressModal = require('../models/adress')
const bycrypt = require('bcrypt');
const dotEnv = require('dotenv');
const puppeteer = require('puppeteer');
const ExcelJS = require('exceljs');
const coupenSchema = require("../models/coupen");
const options = { day: '2-digit', month: 'short', year: 'numeric' };

//order 
const order = async (req, res) => {
    try {
        const perPage = 12;
        const page = req.query.page || 1;
        const orderList = await orderModal.find({}).populate('userId').skip((perPage * page) - perPage)
            .limit(perPage);
        const le = await orderModal.find({})
        const gg = Math.ceil(le.length / perPage)

        if (orderList) {
            let order1 = orderList.reverse()
            res.render('admin/orderDets', { admin: req.session.admin, order: true, orderList: order1, le: le.length, gg, now: page })
        }
    } catch (err) {
        console.log(err.message + '   admin order page rendering route ')
    }
}

//order view
const orderView = async (req, res) => {
    try {
        if (req.params.id) {
            const orderList = await orderModal.findOne({ _id: req.params.id }).populate('OrderedItems.productId userId')
            res.render('admin/order', { admin: req.session.admin, order: true, orderList })
        } else {
            res.redirect('admin/orders')
        }
    } catch (err) {
        console.log(err.message + '     order view ')
    }
}

//remove order product
const removeorder = async (req, res) => {
    try {
        const removeorder = await orderModal.findByIdAndUpdate({ _id: req.body.id }, { $pull: { OrderedItems: { productId: req.body.pro } } })
        if (removeorder) {
            res.send({ succes: true })
        }
    } catch (err) {
        console.log(err.message + '    removeorder')
    }
}
//remove order 
const removeordeFull = async (req, res) => {
    try {
        const removeorder = await orderModal.findByIdAndDelete({ _id: req.body.id })
        console.log(removeorder)
        if (removeorder) {
            res.send({ succes: true })
        }
    } catch (err) {
        console.log(err.message + '    removeorder')
    }
}

//orderProstatus
const orderProstatus = async (req, res) => {
    try {
        const orderNew = await orderModal.findOneAndUpdate({ _id: req.body.id, 'OrderedItems.productId': req.body.proId }, { $set: { 'OrderedItems.$.orderProStatus': req.body.val } }, { new: true })
        if (orderNew.OrderedItems.length == 1) {
            await orderModal.findOneAndUpdate({ _id: orderNew._id }, { $set: { orderStatus: req.body.val } })
        } else {
            let counts = {};
            let length = orderNew.OrderedItems.length
            orderNew.OrderedItems.forEach(element => {
                counts[element.orderProStatus] = (counts[element.orderProStatus] || 0) + 1;
            });
            let mostRepeatedElement;
            let maxCount = 0;
            console.log(counts)
            for (const element in counts) {
                if (counts[element] > maxCount) {
                    mostRepeatedElement = element;
                    maxCount = counts[element];
                } else if (counts[element] = maxCount) {
                    if (element == 'canceled') {
                        continue;
                    } else if (mostRepeatedElement == 'canceled') {
                        mostRepeatedElement = element;
                    }
                } else if (mostRepeatedElement == 'canceled') {
                    if (maxCount !== length) {
                        mostRepeatedElement = 'shipped'
                    }
                } else if (mostRepeatedElement == 'delivered') {
                    if (maxCount !== length) {
                        mostRepeatedElement = 'shipped'
                    }
                }

            }

            await orderModal.findOneAndUpdate({ _id: orderNew._id }, { $set: { orderStatus: mostRepeatedElement } })

        }
    } catch (err) {
        console.log(err.message + ' orderProstatus')
    }
}


module.exports={
    order,
    orderView,
    removeorder,
    removeordeFull,
    orderProstatus
}
