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



//offerPage
const offerPage = async (req, res) => {
    try {
        const offer = await offerSchema.find({})
        res.render('admin/offer', { admin: req.session.admin, offer })
    } catch (err) {
        console.log(err.message + ' offerPage')
    }
}

//offerCreating
const offerCreating = async (req, res) => {
    try {
        const offerCreate = await offerSchema.create({
            name: req.body.name,
            offer: req.body.offer
        })
        if (offerCreate) {
            res.redirect('/admin/offer')
        } else {
            res.send('somthing issue there')
        }
    } catch (err) {
        console.log(err.message + ' offerCreating')
    }
}

//offerProductAdd and removing
const offerProductAdd = async (req, res) => {
    try {
        await offerSchema.findOne({ _id: req.params.id })
        if (req.body.add) {
            const data = await productModal.findOne({ _id: req.body.id });
            const offerPrice = data.price / 100 * (100 - req.body.offer)
            await productModal.findOneAndUpdate({ _id: req.body.id }, { $set: { offer: req.params.id, price: offerPrice } })
        } else {
            const data = await productModal.findOne({ _id: req.body.id });
            await productModal.findOneAndUpdate({ _id: req.body.id }, { $unset: { offer: 1 }, $set: { price: data.actualPrice } })
        }
    } catch (err) {
        console.log(err.message + '   offerProductAdd')
    }
}

//offerProduct
const offerProduct = async (req, res) => {
    try {
        const offer = await offerSchema.findOne({ _id: req.params.id })
        const product = await productModal.find({});
        res.render('admin/offerProduct', { admin: req.session.admin, product, id: req.params.id, offer: offer.offer })
    } catch (err) {
        conosle.log(err.message + '    offerProduct')
    }
}

//addOfferPage
const addOfferPage = async (req, res) => {
    try {

        res.render('admin/addOffer', { admin: req.session.admin, creat: 'offer' })
    } catch (err) {
        console.log(err.message + '  addOfferPage')
    }
}

//offerEdit
const offerEdit = async (req, res) => {
    try {
        const data = await offerSchema.findOne({ _id: req.params.id })
        res.render('admin/addOffer', { admin: req.session.admin, edit: 'offeredit', data, id: data._id })
    } catch (err) {
        console.log(err.message + '   offerEdit')
    }
}

// getofferEdit
const getofferEdit = async (req, res) => {
    try {
        const { name, offer } = req.body;
        const data = await offerSchema.findOneAndUpdate({ _id: req.params.id }, { $set: { name, offer } })
        res.redirect('/admin/offer')

    } catch (err) {
        console.log(err.message + '    getofferEdit')
    }
}

//offerdeleat
const offerdeleat = async (req, res) => {
    try {
        const gg = await productModal.find({ offer: req.params.id })
        gg.forEach(async (e) => {
            await productModal.findOneAndUpdate({ _id: e._id }, { $unset: { offer: '' }, $set: { price: e.actualPrice } })
        })
        await offerSchema.findOneAndDelete({ _id: req.params.id })
        res.redirect('/admin/offer')
    } catch (err) {
        console.log(err.message + ' offerdeleat')
    }
}

module.exports={
    offerPage,
    offerCreating,
    offerProductAdd,
    offerProduct,
    addOfferPage,
    offerEdit,
    getofferEdit,
    offerdeleat,
}