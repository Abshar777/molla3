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



//coupenPage rendering
const coupenPage = async (req, res) => {
    const coupen = await coupenSchema.find({}) || [];
    res.render('admin/coupen', { admin: req.session.admin, coupen })
}

// coupenCreating 
const coupenCreating = async (req, res) => {
    try {
        let id = coupenId.generateRandomId()
        let flag = 0;
        while (flag == 1) {

            let data = await coupenSchema.findOne({ ID: id })
            if (!data) {
                flag = 1
            } else {
                id = coupenId.generateRandomId()
            }
        }
        const coupen1 = await coupenSchema.create({
            name: req.body.name,
            offer: req.body.offer,
            from: req.body.from,
            to: req.body.to,
            ID: id,
            image: req.files[0].filename

        })
        if (coupen1) {
            res.redirect('/admin/coupen')
        } else {
            res.send('somthing wrong')
        }
    } catch (err) {
        console.log(err.message + '    coupenCreating')
    }
}

// coupenRemove
const coupenRemove = async (req, res) => {
    try {
        const coupen = await coupenSchema.findOneAndDelete({ _id: req.params.id });
        const imagePath = path.join(__dirname, '../public/productImage', coupen.image);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }
        if (coupen) {
            res.send({ set: true })
        }
    } catch (err) {
        console.log(err.message + '  coupenRemove')
    }
}

// coupenRemove
const coupenEdit = async (req, res) => {
    try {
        const coupen = await coupenSchema.findOne({ _id: req.params.id });
        const image = req.files[0] || coupen.image;
        const coupenNew = await coupenSchema.findOneAndUpdate({ _id: req.params.id }, {
            $set: {
                name: req.body.name,
                offer: req.body.offer,
                from: req.body.from,
                to: req.body.to,
                image: image
            }
        });
        if (req.files[0]) {

            const imagePath = path.join(__dirname, '../public/productImage', coupen.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }

        }
        if (coupenNew) {
            res.redirect('/admin/coupen')
        } else {
            res.send('somthing issue')
        }
    } catch (err) {
        console.log(err.message + '  coupenEdit')
    }
}

module.exports={
    coupenPage,
    coupenCreating,
    coupenRemove,
    coupenEdit,
}