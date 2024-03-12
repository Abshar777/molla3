const userSchema = require("../models/userSchema");
const orderModal = require('../models/orders')
const categoryModal = require('../models/catagory')
const productModal = require('../models/products');
const bycrypt = require('bcrypt');
require('dotenv').config();
const fs = require('fs');
const path = require('path')
const { v4: uuid } = require('uuid')
const wallet = require('../models/wallet');
const banner = require('../models/banner')
const securePassword = require('../util/scurePassword')
const randomArray = require('../util/getRandomElementsFromArray')


//home
const home = async (req, res) => {
    const Homebanner = await banner.findOne({ name: 'home' })
    const cetgory = await categoryModal.find({})
    const product = await productModal.find({ stock: { $gt: 0 }, status: true }).populate('category offer')
    if (req.session.login) {
        res.render('client/home', { login: req.session.login, cetgory, product, Homebanner })
    }
    else {

        res.render('client/home', { cetgory, product, Homebanner })
    }
}

//shop
const shop = async (req, res) => {
    try {

        const perPage = 12;
        const page = req.query.page || 1;
        const cetgory = await categoryModal.find({});

        const le = await productModal.find({ stock: { $gt: 0 }, status: true })

        const gg = Math.ceil(le.length / 12)


        if (gg < page && gg !== 0) {
            res.redirect(`/shop/`)
        }

        const Allproduct = await productModal.find({ stock: { $gt: 0 }, status: true }).populate('category offer').skip((perPage * page) - perPage)
            .limit(perPage);
        let product = [];
        Allproduct.forEach((e, i) => {
            if (e.category.active == true) {
                product.push(e)
            }
        })

        if (req.session.login) {

            res.render('client/shop', { login: req.session.login, Allproduct: product, cetgory, banner: 'all product', le: le.length, gg, now: page })

        } else {
            res.render('client/shop', { Allproduct: product, cetgory, banner: 'all product', le: le.length, gg, now: page })

        }
    } catch (err) {
        console.log(err.message + '        shop route');
    }
}

//profile
const profile = async (req, res) => {
    try {
        const cetgory = await categoryModal.find({})
        const user = await userSchema.findOne({ _id: req.session.login });
        const wallet1 = await wallet.findOne({ userId: req.session.login })
        const walletAmount = wallet1?.amount || 0;
        // console.log(user);
        if (user.is_admin === 0) {
            // console.log('is note admin')
            res.render('client/profile', { user, login: req.session.login, walletAmount, cetgory })
        }
        else {
            req.session.admin = user;
            res.redirect('/admin')
        }
    } catch (err) {
        console.log(err.message + '         profile route');
    }
}

//product dets
const productDets = async (req, res) => {
    try {
        const cetgory = await categoryModal.find({})
        if (req.query.proId) {

            if (req.session.login) {

                const productDet = await productModal.findOne({ _id: req.query.proId }).populate('category')
                const cat = await categoryModal.find({ gender: productDet.category.gender })
                const arr = [];
                for (const el of cat) {
                    const product = await productModal.findOne({ category: el._id, _id: { $ne: productDet._id } }).populate('category').limit(5)
                    arr.push(product)
                }
                const arr1 = arr.filter(Boolean)
                res.render('client/productDet', { login: req.session.login, productDet, cetgory, Allproduct: arr1 })
            } else {
                const productDet = await productModal.findOne({ _id: req.query.proId }).populate('category offer');

                const cat = await categoryModal.find({ gender: productDet.category.gender })

                const arr = [];
                const le = 0;
                for (const el of cat) {
                    let product = await productModal.find({ category: el._id, _id: { $ne: productDet._id } }).populate('category offer').limit(5)
                    for (const al of product) {
                        console.log(product)
                        arr.push(al)
                    }

                }


                const ogArray = randomArray(arr, 5)

                res.render('client/productDet', { productDet, cetgory, Allproduct: ogArray })

            }
        } else {
            res.redirect('/shop')
        }
    } catch (err) {
        console.log(err.message)
    }
}

//logout 
const logout = async (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.log(err);
                res.send("Error");
            }
            else {

                res.redirect('/');
            }
        })

    } catch (err) {
        console.log(err.message + '         logout route')
    }
}

//changePassword render
const changePassword = async (req, res) => {
    try {
        const cetgory = await categoryModal.find({})
        const msg = req.flash('msg')
        res.render('client/changepass', { msg, cetgory })
    } catch (err) {
        console.log(err.message + '   changePassword render')
    }
}

// change password post
const changePasswordpost = async (req, res) => {
    try {
        const id = req.session.login ? req.session.login : req.session.admin_id;
        if (id) {
            const data = await userSchema.findOne({ _id: id });
            console.log(req.body.current)
            const passmatch = await bycrypt.compare(req.body.current, data.password);
            if (passmatch) {

                const sp = await securePassword(req.body.password)

                const updatPass = await userSchema.findOneAndUpdate({ _id: id }, { $set: { password: sp } })
                console.log(updatPass)
                res.redirect('/profile')
            } else {
                req.flash('msg', 'the password is incorrect')
                res.redirect('/changpass')
            }
        }
    } catch (err) {
        console.log(err.message + '   /changePassword')
    }
}

//edit profile post
const editprofile = async (req, res) => {
    try {
        const data = await userSchema.findOneAndUpdate({ _id: req.params.id }, { $set: { name: req.body.name, email: req.body.email } });
        if (data) {
            res.redirect('/profile');
        } else {
            res.redirect('/login')
        }
    } catch (err) {
        console.log(err.message + '    editprofile')
    }
}

//ccoupenView
const coupenView = async (req, res) => {
    try {
        const cetgory = await categoryModal.find({})
        const coupen = await userSchema.findOne({ _id: req.session.login }).populate('coupens.coupenId')

        res.render('client/coupen', { login: req.session.login, coupen: coupen.coupens, cetgory })
    } catch (err) {
        console.log(err.message + '     coupenView')
    }
}

//coupenCode
const coupenCode = async (req, res) => {
    try {
        const hh = req.body.id.trim()
        const id = String(hh)
        const dataExist = await userSchema.findOne({ _id: req.params.id, 'coupens.ID': id }).populate("coupens.coupenId");
        req.session.coupenId = id
        let offer;
        if (dataExist) {
            dataExist.coupens.forEach((e) => {
                if (e.ID == id) {
                    offer = e.coupenId.offer
                }
            })
            req.session.offer = offer
            res.redirect('/checkoutPage')
        } else {
            req.flash('msg', "coupen did'nt exist")
            res.redirect('/cart')
        }
    } catch (err) {
        console.log(err.message + ' coupenCode')
    }
}

//catgory
const catgory = async (req, res) => {
    try {
        const cetgory = await categoryModal.find({})
        const name = RegExp(`${req.params.id}`, 'i')
        const perPage = 12;
        const page = req.query.page || 1;
        const data = await categoryModal.findOne({ name: name })
        const le = await productModal.find({ category: data._id })

        const gg = Math.ceil(le.length / 12)
        console.log(gg)
        if (gg < page && gg !== 0) {
            console.log('note')
            res.redirect(`/cetgory/${req.params.id}`)
        }
        const product = await productModal.find({ category: data._id }).populate('category offer').skip((perPage * page) - perPage)
            .limit(perPage);
        if (req.session.login) {

            res.render('client/shop', { login: req.session.login, Allproduct: product, cetgory, banner: req.params.id, le: le.length, gg, now: page })

        } else {
            res.render('client/shop', { Allproduct: product, cetgory, banner: req.params.id, le: le.length, gg, now: page })

        }
    } catch (err) {
        console.log(err.message + '   catgory')
    }
}

//serach suggetion
const search = async (req, res) => {
    try {
        const type = typeof req.query.val === 'string'
        if (type) {
            const payload = req.query.val.trim()
            const content = new RegExp(`.*${payload}.*`, 'i');
            const data = await productModal.find({ $and: [{ $or: [{ name: { $regex: content } }, { description: { $regex: content } }, { createdAt: { $regex: content } }] }, { status: true }] }).populate('category offer').exec()
            const cat = await categoryModal.find({ $or: [{ name: { $regex: content } }, { gender: { $regex: content } }] })
            const result = data.concat(cat)
            res.send({ result })

        } else {
            const result = await productModal.find({ status: true, $or: [{ price: req.body.val }, { stock: req.body.val }] }).populate('category offer').exec()
            res.send({ result })
        }
    } catch (err) {
        console.log(err.message + ' search')
    }
}

//searchItem
const searchItem = async (req, res) => {
    try {
        const perPage = 12;
        const page = req.query.page || 1;
        const payload = req.query.q.trim()
        const content = new RegExp(`.*${payload}.*`, 'i');
        const cetgory = await categoryModal.find({});
        const cat = await categoryModal.find({ $or: [{ name: { $regex: content } }, { gender: { $regex: content } }] })
        if (cat.length == 0) {
            const le = await productModal.find({ $and: [{ $or: [{ name: { $regex: content } }, { description: { $regex: content } }, { createdAt: { $regex: content } }] }, { status: true }] }).populate('category offer').exec()
            const product = await productModal.find({ $and: [{ $or: [{ name: { $regex: content } }, { description: { $regex: content } }, { createdAt: { $regex: content } }] }, { status: true }] }).populate('category offer').skip((perPage * page) - perPage)
                .limit(perPage);
            const gg = Math.ceil(le.length / 12);
            if (le.length == 0) {

                res.render('client/shop', { Allproduct: product, cetgory, banner: req.query.q, le: le.length, gg, now: page })

            } else if (gg < page) {
                console.log('jjjjjjhhg')
                res.redirect(`/shop`)
            }
            if (req.session.login) {

                res.render('client/shop', { login: req.session.login, Allproduct: product, cetgory, banner: req.params.id, le: le.length, gg, now: page })

            } else {
                res.render('client/shop', { Allproduct: product, cetgory, banner: req.params.id, le: le.length, gg, now: page })

            }
        } else {
            let le = [];
            for (const e of cat) {
                const g = await productModal.find({ status: true, category: e._id });
                le = le.concat(g);

            }
            const f = (perPage * page) - perPage;
            const product = le.slice(f, f + perPage)
            const gg = Math.ceil(le.length / 12)
            if (le.length == 0) {

                res.render('client/shop', { Allproduct: product, cetgory, banner: req.query.q, le: le.length, gg, now: page })

            } else if (gg < page) {
                console.log('jjjjjjhhg')
                res.redirect(`/shop`)
            }
            if (req.session.login) {

                res.render('client/shop', { login: req.session.login, cetgory, Allproduct: product, banner: req.query.q, le: le.length, gg, now: page })

            } else {
                res.render('client/shop', { Allproduct: product, cetgory, banner: req.query.q, le: le.length, gg, now: page })

            }
        }
    } catch (err) {
        console.log(err.message + '  searchItem')
    }
}

//shopFilter
const shopFilter = async (req, res) => {
    try {
        const perPage = 12;
        const page = req.query.now || 1;
        if (req.query.val == 'defualt') {
            const val = await productModal.find({}).populate('category offer')
            const data = val.reverse()
            const f = (perPage * page) - perPage;
            const product = data.slice(f, f + perPage)
            res.status(200).json({ data: product })
        } else if (req.query.val == 'popularity') {
            const data1 = await orderModal.aggregate([
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
                }

            ])
            const data = [];
            console.log(data1)
            for (let i = 0; i < data1[0]?.productData.length; i++) {
                let val = await productModal.findOne({ _id: data1[0]?.productData[i]._id }).populate('category offer');
                data.push(val)
            }
            const f = (perPage * page) - perPage;
            const product = data.slice(f, f + perPage)
            res.status(200).json({ data: product })
        } else if (req.query.val == 'cheapest') {
            const data = await productModal.find({}).sort({ price: 1 }).populate('category offer')
            const f = (perPage * page) - perPage;
            const product = data.slice(f, f + perPage)
            res.status(200).json({ data: product })
        } else if (req.query.val == 'premium') {
            const data = await productModal.find({}).sort({ price: -1 }).populate('category offer')
            const f = (perPage * page) - perPage;
            const product = data.slice(f, f + perPage)
            res.status(200).json({ data: product })
        } else {
            res.status(400).json({ err: 'errr' })
        }
    } catch (err) {
        console.log(err.message + ' shopFilter')
    }
}

//catch all
const catchAll = async (req, res) => {
    try {
        const cetgory = await categoryModal.find({})
        if (req.session.login) {
            res.render('client/404', { login: req.session.login, cetgory })
        }
        else {

            res.render('client/404', { cetgory })
        }
    } catch (err) {
        res.status(400).send({ faild: true })
    }
}

//about
const about = async (req, res) => {
    try {
        const Aboutbanner = await banner.findOne({ name: 'about' })
        console.log(Aboutbanner)
        const cetgory = await categoryModal.find({})
        const product = await productModal.find({ stock: { $gt: 0 }, status: true }).populate('category offer')

        res.render('client/about', { login: req.session.login || false, cetgory, product, Aboutbanner })
    } catch (err) {
        console.log(err.message + '   aboute')
        res.status(400).send({ failed: true })
    }
}

//faq
const faq = async (req, res) => {
    try {
        const Aboutbanner = await banner.findOne({ name: 'about' })
        const cetgory = await categoryModal.find({})
        const product = await productModal.find({ stock: { $gt: 0 }, status: true }).populate('category offer')

        res.render('client/faq', { login: req.session.login || false, cetgory, product, Aboutbanner })
    } catch (err) {
        console.log(err.message + '    faq');
        res.status(400).send({ faild: err.messsage })
    }
}

module.exports = {
    home,
    shop,
    profile,
    logout,
    productDets,
    changePassword,
    changePasswordpost,
    editprofile,
    coupenView,
    coupenCode,
    catgory,
    search,
    searchItem,
    shopFilter,
    catchAll,
    about,
    faq
}