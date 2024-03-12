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


// product add page
const productAdd = async (req, res) => {
    try {
        const category = await categoryModal.find({})
        res.render('admin/productAdd', { admin: req.session.admin, productAdd: 'prod', categoryList: category });
    } catch (err) {
        console.log(err.message + '     productadd route ')
    }
}

//getting product dets
const getproduct = async (req, res) => {
    try {
        let imgeArray = [];
        const images = req.files;
        images.forEach((file) => {
            imgeArray.push(file.filename);
        });

        const currentDate = new Date();
        const formattedDate = currentDate.toLocaleDateString('en-US', options);
        const category_id = await categoryModal.findOne({ name: req.body.category })
        const product = await productModal.create({
            name: req.body.name,
            description: req.body.des,
            price: req.body.price,
            category: category_id,
            createdAt: formattedDate,
            status: req.body.active,
            stock: req.body.stock,
            images: imgeArray,
            actualPrice: req.body.price
        })
        res.redirect('/admin/product')
    } catch (err) {
        console.log(err.message + '         product add')
    }
}

//product dets page rendering
const productDets = async (req, res) => {
    try {
        const perPage = 8;
        const page = req.query.page || 1;
        const le = await productModal.find({}).populate('category')
        const products = await productModal.find({}).populate('category').skip((perPage * page) - perPage)
            .limit(perPage);
        const gg = Math.ceil(le.length / perPage)

        const ca = await categoryModal.find({})
        res.render('admin/products', { admin: req.session.admin, product: products, ca, le: le.length, gg, now: page })
    } catch (err) {
        console.log(err.message + '        product dets showing page err')
    }
}

//product edit page 
const editProduct = async (req, res) => {
    try {
        const elementsToRemove = req.body.pe;


        const result = await productModal.findOne({ _id: req.query.id })
        let rem = false
        if (typeof (elementsToRemove) == 'object') {

            var oldData = await productModal.findOneAndUpdate(
                { _id: req.query.id },
                { $pull: { images: { $in: elementsToRemove } } },
                { new: true }
            );
            rem = true
        } else {
            var oldData = await productModal.findOneAndUpdate(
                { _id: req.query.id },
                { $pull: { images: elementsToRemove } },
                { new: true }
            );

        }
        const category_id = await categoryModal.findOne({ name: req.body.category })
        let flag = 0;
        if (req.files.images0) {

            flag++;
        } if (req.files.images1) {

            flag++;
        }
        if (req.files.images2) {

            flag++;
        }



        let imgeArray = [];
        if (flag !== 0) {

            for (let i = 0; i < flag; i++) {

                if (i == 0) {
                    if (req.files.images0) {
                        let imge0 = req.files.images0
                        imgeArray[i] = imge0[0].filename;
                        // if(oldData.images[0]){

                        //     const imagePath = path.join(__dirname, '../public/productImage',oldData.images[0]); 
                        //      if (fs.existsSync(imagePath)) {
                        //         fs.unlinkSync(imagePath);

                        //       }
                        // }
                        flag++;
                        continue;

                    } else {
                        if (oldData.images[0]) {
                            if (req.body.pe0) {
                                console.log(req.body.pe0 + 'first')
                                flag++;
                                continue;
                            } else {

                                console.log(oldData.images[0] + 'first')
                                imgeArray[i] = oldData.images[0]

                                flag++;
                            }
                        } else {

                            flag++;
                        }
                    }


                } else if (i == 1) {
                    if (req.files.images1) {
                        console.log('second')
                        let imge1 = req.files.images1
                        imgeArray[i] = imge1[0].filename;
                        if (oldData.images[1]) {
                            const imagePath = path.join(__dirname, '../public/productImage', oldData.images[1]);
                            if (fs.existsSync(imagePath)) {
                                fs.unlinkSync(imagePath);

                            }
                        }
                        flag++;
                        continue;

                    } else {
                        if (oldData.images[1]) {
                            if (req.body.pe1) {


                                flag++;
                                continue;
                            } else {

                                console.log(oldData.images[1] + 'second')
                                imgeArray[i] = oldData.images[1]

                                flag++;
                            }
                        } else {
                            flag++;
                        }
                    }

                } else if (i == 2) {
                    if (req.files.images2) {
                        let imge2 = req.files.images2
                        imgeArray[i] = imge2[0].filename;
                        if (oldData.images[2]) {
                            const imagePath = path.join(__dirname, '../public/productImage', oldData.images[2]);
                            if (fs.existsSync(imagePath)) {
                                fs.unlinkSync(imagePath);

                            }
                        }


                    } else {
                        if (oldData.images[2]) {

                            imgeArray[i] = oldData.images[2];
                        }
                        if (oldData.images[1] && req.body.pe1) {
                            imgeArray[1] = oldData.images[1]
                        }

                    }
                }

            }
        } else {
            oldData.images.forEach(e => {

                imgeArray.push(e)
            })
        }
        const newArray = imgeArray.filter(Boolean);

        const done = await productModal.findOneAndUpdate({ _id: req.query.id }, { $set: { name: req.body.name, price: req.body.price, stock: req.body.stock, category: category_id, images: newArray } })
        if (done) {
            // res.send( imgeArray)
            res.redirect('/admin/product');
        } else {

            res.send("fucked")
        }

    } catch (err) {
        console.log(err.message + '      edit product routr')
    }


}

// dlt product 
const dltPro = async (req, res) => {
    try {
        const don = await productModal.findOneAndDelete({ _id: req.query.id })
        don.images.forEach(e => {
            const imagePath = path.join(__dirname, '../public/productImage', e);

            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);

            }
        });
        if (don) {
            res.redirect('/admin/product');
        }
    } catch (err) {
        console.log(err.message + '       dlt product')
    }
}

// product soft deleat
const proStatus = async (req, res) => {
    try {
        const product=await productModal.findOne({_id:req.query.id});
        product.status=!product.status
        product.save();
        res.status(200).send({su:'succes'})
    } catch (err) {
        console.log(err.message + ' prostatus')
        res.status(500).send(err.message)
    }
}

module.exports={
    productAdd,
    getproduct,
    productDets,
    editProduct,
    dltPro,
    proStatus
}