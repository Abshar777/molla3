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

//admin page rendering
const adminPage = async (req, res) => {
    try {
        const orderList1 = await orderModal.find({}).sort({ _id: -1 }).populate('userId');
        const productCount = await productModal.find({})
        const userCount = await userSchema.find({}).sort({ date: -1 });
        const recentUser = userCount.slice(0, 3)
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const startDate = new Date(currentDate.getFullYear(), currentMonth);
        const endDate = new Date(currentDate.getFullYear(), currentMonth + 1, 0);
        const month = await orderModal.aggregate([{
            $match: {
                orderDate: {
                    $gte: startDate,
                    $lte: endDate
                }
            }
        }, {
            $group: {
                _id: '$peyment',
                sale: { $sum: '$orderAmount' }
            }
        }
        ])
        const monthSale = month.reduce((acc, val) => acc + val.sale, 0)
        const orderList = await orderModal.aggregate([{
            $group: {
                _id: '$peyment',
                totalAmount: { $sum: '$orderAmount' },
                totalCount: { $sum: 1 }
            }
        }])

        const op = await orderModal.find({ peyment: 'online peyment' }).sort({ _id: -1 }).limit(1)
        const cod = await orderModal.find({ peyment: 'cod' }).sort({ _id: -1 }).limit(1)
        let count = 0;
        orderList.forEach(e => {
            count += e.totalCount;
        })

        const most = await orderModal.aggregate([
            {
                $unwind: '$OrderedItems'
            },
            {
                $group: {
                    _id: '$OrderedItems.productId',
                    totalCount: { $sum: '$OrderedItems.quantity' },
                    orderDates: { $push: '$orderDate' }
                }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'productData'
                }
            },
            {
                $sort: { totalCount: -1 }
            }, {
                $limit: 5
            }

        ])
        const daily = await orderModal.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$orderDate' } },
                    totalAmount: { $sum: '$orderAmount' }
                }
            },
            {
                $sort: { _id: -1 }
            }
        ])
        const yearly = await orderModal.aggregate([
            {
                $group: {
                    _id: { $year: '$orderDate' },
                    totalAmount: { $sum: '$orderAmount' }
                }
            },
            {
                $sort: { _id: -1 }
            }
        ])

        res.render('admin/dashboard', { admin: req.session.admin, home: 'home', most, orderList, count, op, cod, monthSale, daily, yearly, userCount, productCount, orderList1, recentUser })
    } catch (err) {
        console.log(err.message + '     admin first route');
    }
}

//year chart fetching
const year = async (req, res) => {
    try {
        const currentYear = new Date().getFullYear();


        const year = await orderModal.aggregate([
            {
                $match: {
                    orderDate: { $gte: new Date(`${currentYear - 5}-01-01`), $lte: new Date(`${currentYear}-12-31`) }
                }
            },
            {
                $group: {
                    _id: { $year: '$orderDate' },
                    totalAmount: { $sum: '$orderAmount' }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ])
        // console.log(year);
        res.send({ year })
    } catch (err) {
        console.log(err.message + '    year fetching ')
    }
}

//peyment chart fetching 
const peyment = async (req, res) => {
    try {
        const orderList = await orderModal.aggregate([{
            $group: {
                _id: '$peyment',
                totalAmount: { $sum: '$orderAmount' },
                totalCount: { $sum: 1 }
            }
        }])


        let count = 0;
        orderList.forEach(e => {
            count += e.totalCount;
        })
        res.send({ orderList, count })
    } catch (err) {
        console.log(err.message + '    peyment fetching ')
    }
}

//userList page rendering
const users = async (req, res) => {
    try {
        const perPage = 8;
        const page = req.query.page || 1;
        const le = await userSchema.find({ is_admin: 0 })
        const users = await userSchema.find({ is_admin: 0 }).skip((perPage * page) - perPage)
            .limit(perPage);
        const gg = Math.ceil(le.length / perPage)

        res.render('admin/userList', { admin: req.session.admin, users, user: 'user', le: le.length, gg, now: page })


    } catch (err) {
        console.log(err.message + '     users addd route')
    }
}

//is block or not fetching
const blockFetch = async (req, res) => {
    try {

        const blockornot = await userSchema.findOne({ _id: req.body.payload })

        if (blockornot.is_block) {
            const blockTrue = await userSchema.findOneAndUpdate({ _id: req.body.payload }, { $set: { is_block: false } })

            if (blockTrue._id) {

                const updatedData = await userSchema.findOne({ _id: blockTrue._id });

                res.send({ updatedData, blocked: 'is blocked' });
            }
        } else {
            const blockTrue = await userSchema.findOneAndUpdate({ _id: req.body.payload }, { $set: { is_block: true } })


            if (blockTrue._id) {

                const updatedData = await userSchema.findOne({ _id: blockTrue._id });

                res.send({ updatedData });
            }
        }

    } catch (err) {
        console.log(err.message + '       bloack fetching data')
    }
}


    module.exports = {
        adminPage,  
        users,
        blockFetch,
        peyment,
        year,
      
       
    }