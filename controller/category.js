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



//catgory Add page rendering
const catgoryAdd = async (req, res) => {
    try {
        res.render('admin/catagory', { admin: req.session.admin, categoryAdd: true })
    } catch (err) {
        console.log(err.message + '       catgory route ')
    }
}

//get catagory add 
const getcatgoryAdd = async (req, res) => {
    try {

        const category = await categoryModal.create({
            name: req.body.name,
            gender: req.body.gender,
            active: req.body.active,

        })
        if (category) {
            res.redirect('/admin/catagory')
        }
        else {
            res.send('somthing isuue there')
        }
    } catch (err) {
        console.log(err.message + '          getting castgory  ')
    }
}

//category dets page rendering
const category = async (req, res) => {
    try {
        const categorys = await categoryModal.find({})
        if (categorys) {
            res.render('admin/catagoryDet', { categorys, admin: req.session.admin, category: true })
        }
    } catch (er) {
        console.log(er.message + '    category dets ')
    }
}

// catgory fetch 
const categoryFetch = async (req, res) => {
    try {
        const pattern = new RegExp(`^${req.body.name}$`, 'i');
        const name = await categoryModal.findOne({ name: pattern })
        if (name) {
            res.send({ exist: true })
        } else {
            res.send({ exist: false })
        }

    } catch (err) {
        console.log(err.message + '     category fetch route ')
    }
}

// category remove
const categorydlt = async (req, res) => {
    try {

        const dltCat = await categoryModal.findOneAndDelete({ _id: req.query.id })
        if (dltCat) {
            res.redirect('/admin/catagory')
        }
        else {
            res.send('you fucked up')
        }
    } catch (err) {
        console.log(err.message + '        categorydlt')
    }
}

//category 
const catgoryActive = async (req, res) => {
    try {

        const activeornot = await categoryModal.findOne({ _id: req.body.payload })
        console.log(activeornot.active)
        if (activeornot.active) {
            const activetrue = await categoryModal.findOneAndUpdate({ _id: req.body.payload }, { $set: { active: false } })

            if (activetrue._id) {

                const updatedData = await categoryModal.findOne({ _id: activetrue._id });

                res.send({ updatedData, blocked: 'is blocked' });
            }
        } else {
            const activetrue = await categoryModal.findOneAndUpdate({ _id: req.body.payload }, { $set: { active: true } })


            if (activetrue._id) {

                const updatedData = await categoryModal.findOne({ _id: activetrue._id });

                res.send({ updatedData });
            }
        }

    } catch (err) {
        console.log(err.message + '       bloack fetching data')
    }
}

module.exports={
    catgoryAdd,
    categoryFetch,
    category,
    getcatgoryAdd,
    categorydlt,
    catgoryActive
}