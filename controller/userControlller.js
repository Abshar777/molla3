const userSchema = require("../models/userSchema");
const orderModal = require('../models/orders')
const categoryModal = require('../models/catagory')
const addressModal = require('../models/adress')
const cartModal = require('../models/cart')
const productModal = require('../models/products');
const wishListModal=require('../models/wishList')
const Razorpay = require('razorpay');
const nodemailer = require('nodemailer');
const bycrypt = require('bcrypt');
const invoiceConfig = require('../config/invoice')
require('dotenv').config();
const fs = require('fs');
const path = require('path')
const { v4: uuid } = require('uuid')
const wallet = require('../models/wallet');
const coupenSchema = require("../models/coupen");
const coupenId = require('../config/coupenId')
const { RAZORPAY_IDKEY, RAZORPAY_SECRET_KEY } = process.env;



// fungctions
const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000);
};




var instance = new Razorpay({
    key_id: RAZORPAY_IDKEY,
    key_secret: RAZORPAY_SECRET_KEY,
});

const verifyemail = async (name, email, otp) => {
    try {

        const transport = nodemailer.createTransport({
            service: "gmail",

            auth: {
                user: "absharameen625@gmail.com",
                pass: "vlfg cejw abfd zkvn",
            }
        });
        const mailoption = {
            from: "absharameen625@gmail.com",
            to: email,
            subject: 'for verification mail',
            html: `<h1>hi ${name} this is for ka e-comares store verification otp <br><br> <a  style='color='blue'; href=''>${otp}</a></h1>`
        }
        transport.sendMail(mailoption, (err, info) => {
            if (err) {
                console.log(err.message);
            }
            else {
                console.log(`Email has been sent: ${info.messageId}`);
                console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
            }
        })
    } catch (error) {
        console.log(error.message);
    }
}


const securePassword = async (pass) => {
    try {
        const passwordHash = await bycrypt.hash(pass, 10);
        return passwordHash;
    }
    catch (err) {
        console.log(err.message);
    }
}
// date setup
const options = { day: '2-digit', month: 'short', year: 'numeric' };
//end 

// routing controllers
//home
const home = async (req, res) => {
    const cetgory = await categoryModal.find({})
    if (req.session.login) {
        res.render('client/home', { login: req.session.login, cetgory })
    }
    else {

        res.render('client/home', { cetgory })
    }
}

//sign-up page rendering 
const signUp = async (req, res) => {
    const cetgory = await categoryModal.find({})
    if (req.session.login) {
        res.redirect('/')
    }
    else if (req.session.err1) {
        const err = req.session.err1
        req.session.err1 = undefined
        res.render('client/login', { err1: err, cetgory })

    }
    else if (req.session.err2) {
        const err = req.session.err2
        req.session.err2 = undefined
        res.render('client/login', { err2: err, cetgory })

    }
    else if (req.session.otp) {
        console.log(req.session.otp);
        res.redirect('/otp');
    }

    else {

        res.render('client/login', { cetgory })
    }
}

//email exist checking
const emailExist = async (req, res) => {
    try {
        console.log(req.body.payload)
        let emailcheck = await userSchema.findOne({ email: req.body.payload })

        if (emailcheck) {

            res.send({ emailExist: 'email exist already' })
        }
        else {
            res.send({ note: 'email exist already' })
        }
    } catch (err) {
        console.log(err.message + '          email checking route')
    }
}

// getting signup page detailes 
const getSignUp = async (req, res) => {
    try {
        const sp = await securePassword(req.body.registerPassword);
        const userData = new userSchema({
            name: req.body.registerName,
            email: req.body.registerEmail,
            password: sp
        });
        const noUser = await userSchema.findOne({ email: req.body.registerEmail });

        if (noUser) {
            console.log('helloooo you fucked usp');
        }
        else {
            req.session.userData = userData
            req.session.otp = generateOTP()

            verifyemail(req.body.registerName, req.body.registerEmail, req.session.otp)
            res.redirect('/otp')
        }
    } catch (error) {
        console.log(error.message);
    }

}

//otp page rendering
const otp = async (req, res) => {
    try {
        console.log(req.session.otp);
        const cetgory = await categoryModal.find({})
        if (req.session.otp) {
            if (req.session.wrong) {

                res.render('client/otp', { message: req.session.wrong, cetgory });
            } else if (req.session.resend) {
                res.render('client/otp', { resend: req.session.resend, cetgory })
            }
            else {
                res.render('client/otp', { cetgory });
            }
        }
        else {
            res.redirect('/login');
        }
    }
    catch (err) {
        console.log(err.message + '    otp');
    }

}

// otp getting
const gettingOtp = async (req, res) => {
    try {
        const otp = req.body.otp
        // const validOtp=req.session.otp;
        if (req.session.otp && req.session.forget) {

            if (Number(otp.join('')) === req.session.otp) {
                const currentDate = new Date();
                req.session.otp = undefined
                res.redirect('/newPass')
                console.log(req.session.otp)

            }
            else {
                req.session.wrong = true;
                res.redirect('/otp')
            }
        } else {

            if (Number(otp.join('')) === req.session.otp) {
                const currentDate = new Date();
                const formattedDate = currentDate.toLocaleDateString('en-US', options);

                const userData = new userSchema({
                    name: req.session.userData.name,
                    email: req.session.userData.email,
                    password: req.session.userData.password,
                    date: formattedDate
                });
                console.log('its are');
                const userSave = await userData.save();
                console.log('its heare')
                if (userSave) {
                    req.session.login = userSave._id;
                    req.session.otp = undefined
                    req.session.wrong = undefined
                    res.redirect('/profile')

                }
                else {
                    res.send('somthing is issue');
                }

            }
            else {
                req.session.wrong = true;
                res.redirect('/otp')
            }
        }
    } catch (err) {
        console.log(err + '       otp routing');
    }



}

//resubmit email id and password
const resubmit = async (req, res) => {
    try {
        req.session.forget = undefined
        req.session.otp = undefined;
        res.redirect('/login')
    } catch (err) {
        console.log(err.message + '    resbmit Route')
    }
}

//resend
const resend = async (req, res) => {
    try {
        if (req.session.wrong) {
            req.session.wrong = null
        }
        if (req.session.otp) {
            req.session.otp = generateOTP()
            verifyemail(req.body.registerName, req.body.registerEmail, req.session.otp)
            req.session.resend = 'check yor email , iam send that'
            res.redirect('/otp')
            req.session.resend = undefined;
        } else {
            res.redirect('/login')
        }

    } catch (er) {
        console.log(er.message + '       resend route')
    }
}

//forget password
const forgetPassword = async (req, res) => {
    try {
        if (!req.session.otp) {
            const cetgory = await categoryModal.find({})
            res.render('client/forgetPassword', { cetgory })
        }
        else {
            res.redirect('/otp')
        }

    } catch (er) {
        console.log(er.message + '        forget Password wrong ');
    }
}

//forget email exist or not fetching data
const forgetemailExist = async (req, res) => {
    try {
        const userData = await userSchema.findOne({ email: req.body.payload, is_block: false })
        if (!userData) {
            res.send({ emailExist: "hello" })
        }
        else {
            res.send({ note: "hello" })
        }

    } catch (err) {
        console.log(err.message + '       forgetemailExist route')
    }
}

//get forget email
const forget = async (req, res) => {
    try {
        req.session.forget = req.body.email;
        req.session.otp = generateOTP()

        const user = await userSchema.findOne({ email: req.session.forget })

        verifyemail(user.name, user.email, req.session.otp)
        res.redirect('/otp')
    } catch (err) {
        console.log(err.message + "       forget gatting route")
    }
}

//geting new pass and the update that
const getNewPass = async (req, res) => {
    try {
        const sp = await securePassword(req.body.password)

        const updatPass = await userSchema.updateOne({ email: req.session.forget }, { $set: { password: sp } })
        if (updatPass) {
            req.session.forget = undefined;
            res.redirect('/login')

        }
        else {
            console.log('somthing new pass not work')
        }
    } catch (err) {
        console.log(err.message + '         get new pass route')
    }
}

//new password page rendering
const newPass = async (req, res) => {
    try {
        if (req.session.forget) {

            res.render('client/newPass', { cetgory })
        } else {
            res.redirect('/login')
        }
    } catch (err) {
        console.log(err.message + '          newpass route')
    }
}

//geting login dets
const getLogin = async (req, res) => {
    try {
        const user = await userSchema.findOne({ email: req.body.email, is_block: false });
        if (user) {
            const passMatch = await bycrypt.compare(req.body.password, user.password);
            if (passMatch) {
                // console.log('password matched');

                req.session.login = user._id;
                res.redirect('/profile')
            }
            else {
                console.log('email is not exist');
                req.session.err2 = 'password is wrong';
                res.redirect('/login')
            }
        }
        else {
            // console.log('password not match');
            req.session.err1 = ' email is note exist';
            res.redirect('/login')
        }
    } catch (err) {
        console.log(err.message + '       get login route errr');
    }
}

//shop
const shop = async (req, res) => {
    try {

        const perPage = 12;
        const page = req.query.page || 1;
        const cetgory = await categoryModal.find({});

        const le = await productModal.find({ stock: { $gt: 0 } })
        const gg = Math.ceil(le.length / 12)
        if (gg < page) {
            res.redirect(`/shop/`)
        }

        const Allproduct = await productModal.find({ stock: { $gt: 0 } }).populate('category offer').skip((perPage * page) - perPage)
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
                const cat=await categoryModal.find({gender:productDet.category.gender})
                const arr=[];
                for(const el of cat){
                    const product = await productModal.findOne({ category: el._id, _id: { $ne: productDet._id } }).populate('category').limit(5)
                    arr.push(product)
                }
                const arr1=arr.filter(Boolean)
                res.render('client/productDet', { login: req.session.login, productDet, cetgory,Allproduct:arr1 })
            } else {
                const productDet = await productModal.findOne({ _id: req.query.proId }).populate('category offer');
                
                const cat=await categoryModal.find({gender:productDet.category.gender})

                const arr=[];
                for(const el of cat){
                    let product = await productModal.findOne({ category: el._id, _id: { $ne: productDet._id } }).populate('category offer').limit(5)

                    arr.push(product)
                }
                const arr1=arr.filter(Boolean)
                res.render('client/productDet', { productDet, cetgory ,Allproduct:arr1})

            }
        } else {
            res.redirect('/shop')
        }
    } catch (err) {
        console.log(err.message)
    }
}

//cart 
const cart = async (req, res) => {
    try {
        const cetgory = await categoryModal.find({})
        const cart = await cartModal.findOne({ userId: req.session.login }).populate('products.productId');

        if (cart) {
            const total = cart.products.reduce((acc, product) => acc + product.price, 0);
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
        const wishlist = await wishListModal.findOne({userId: req.session.login }).populate('products.productId')
        res.render('client/wishlist', { wishlist, login: req.session.login,cetgory })

    } catch (err) {
        console.log(err.message + '      wishList page route')
    }
}

//wishListAdd
const wishListAdd=async(req,res)=>{
    try {
        const result = await wishListModal.findOne({
            userId: req.query.user,
            products: {
                $elemMatch: {
                    productId: req.query.id
                }
            }
        }).exec();
        if(!result){
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
            res.status(200).json({success:true})
            
        }else{
        
            res.status(200).json({exist:true})
        }
            


    } catch(err){
        res.status(500).send(err.message+'wishListAdd')
    }
}

//wishlist remove 
const wishListRemove=async(req,res)=>{
    try{
        const remove = await wishListModal.updateOne({ userId: req.query.user }, {  $pull: { products: { productId: req.query.proid } } })
        res.status(200).json({set:true})
    }catch(err){
        res.status(400).send(err.message+' wishlist remve')
    }
}

// add cart fetching 
const addcart = async (req, res) => {
    try {
        const product = await productModal.findOne({ _id: req.body.id })
        const remove = await wishListModal.updateOne({ userId: req.body.user }, {  $pull: { products: { productId: req.body.id } } })
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
const cartCount=async(req,res)=>{
    try{
        const cart=await cartModal.findOne({userId:req.session.login})
        const wishlist=await wishListModal.findOne({userId:req.session.login})
        console.log(cart.products.length,wishlist.products.length)
        res.status(200).send({cart:cart.products.length||0,wishlist:wishlist.products.length || 0})
    }catch(err){
        res.status(500).send(err.message+'   cartCount')
    }
}

// add cart on post requiset
const addcartPost = async (req, res) => {
    try {
        if (req.query.user) {
            const product = await productModal.findOne({ _id: req.query.id })
        const remove = await wishListModal.updateOne({ userId: req.query.user }, {  $pull: { products: { productId: req.query.id } } })

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
        const newval = product.price * req.body.quantity;

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

        const total = updatedCart.products.reduce((acc, product) => acc + product.price, 0);

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

        const remove = await cartModal.updateOne({ _id: req.body.id }, { $set: { TotalPrice: req.body.tot }, $pull: { products: { productId: req.body.proid } } })
        if (remove.modifiedCount === 0) {

        } else {
            const rdata = await cartModal.findOne({ _id: req.body.id })
            console.log(rdata)
            res.send({ rdata })

        }

    } catch (err) {
        console.log(err.message + '   catrreeee')
    }
}

//adress
const adress = async (req, res) => {
    try {
        const user = await userSchema.findOne({ _id: req.session.login })
        const cetgory = await categoryModal.find({})
        if (user.is_admin === 0) {
            const adress = await addressModal.findOne({ userId: req.session.login })
            if (adress) { }

            res.render('client/adress', { user, login: req.session.login, adress, cetgory })
        }
        else {
            req.session.admin = user;
            res.redirect('/admin')
        }

    } catch (err) {
        console.log(err.message + '   adress route')
    }
}

//get address
const getadress = async (req, res) => {
    try {
        const exits = await addressModal.findOne({ userId: req.query.id, address: { $elemMatch: { name: req.body.name } } })
        if (!exits) {
            const update = {
                $set:
                    { userId: req.query.id },
                $addToSet:
                {
                    address:
                        { name: req.body.name, city: req.body.city, state: req.body.state, pincode: req.body.pincode }
                }
            }
            const options = {
                upsert: true,
                new: true,
            }

            const newAdress = await addressModal.findOneAndUpdate({ userId: req.query.id }, update, options)
            if (newAdress) {
                res.redirect('/adress')
            } else {
                res.send('its brocked')
            }
        } else {

        }

    } catch (err) {
        console.log(err.message + '    get addresss route')
    }
}

// patchaddress
const patchaddress = async (req, res) => {
    try {

        const exists = await addressModal.findOne({ userId: req.body.id, address: { $elemMatch: { name: req.body.val } } })
        if (exists) {
            res.send({ exists })
        } else {

            res.send({ note: 'note' })
        }
    } catch (err) {
        console.log(err.message + '    gpatch addresss route')
    }
}

//remove address
const removeadress = async (req, res) => {
    try {
        console.log(req.body.uid)
        console.log(req.body.id)
        const remove = await addressModal.updateOne({ userId: req.body.uid }, { $pull: { address: { _id: req.body.id } } })

        if (remove.modifiedCount === 0) {
            console.log('nottt exjh;hoi')
        } else {

            res.send({ remove })

        }
    } catch (err) {
        console.log(err.message + '   remove addresss')
    }
}

// checkoutPage page rendering
const checkoutPage = async (req, res) => {
    try {
        const cetgory = await categoryModal.find({})
        const coupenOffer = req.session.offer || 0;
        const user = await userSchema.findOne({ _id: req.session.login })
        const cart = await cartModal.findOne({ userId: req.session.login }).populate('products.productId');
        const wallet1 = await wallet.findOne({ userId: req.session.login })
        const walletAmount = wallet1?.amount || 0;
        let add;
        const adress = await addressModal.findOne({ userId: req.session.login })
        if (adress) {
            adress.address.forEach(e => {
                if (e._id + 'hh' == user.addressId + 'hh') {
                    add = e

                } else {


                }
            })
            res.render('client/checkout', { login: req.session.login, add, cart, walletAmount, coupenOffer, cetgory })
        } else {
            res.render('client/checkout', { login: req.session.login, cart, walletAmount, coupenOffer, cetgory })

        }



    } catch (err) {
        console.log(err.message + '     checkoutPage page rendiering route')
    }
}

// changing deafualt addres in user schema in in fetching 
const Defaddress = async (req, res) => {
    try {
        const added = await userSchema.findOneAndUpdate({ _id: req.body.uid }, { $set: { addressId: req.body.id } }, { new: true })
        if (added) {


            res.send({ done: added })
        } else {
            res.send({ done: 'moonji' })

        }
    } catch (err) {
        console.log(err.message + '        Defaddress route ')
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
                    key_id: RAZORPAY_IDKEY,
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
            await wallet.findOneAndUpdate({ userId: req.session.login }, { $inc: { amount: ne } })
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
            .limit(perPage);;

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
                await wallet.findOneAndUpdate({ userId: req.body.user }, { $inc: { amount: req.body.price } }, { new: true, upsert: true });
            }

            res.send({ set: true })
        } else {
            res.send({ issue: true })

        }
    } catch (err) {
        console.log(err.message + ' /editOrder')
    }
}


//chacking route
const check = async (req, res) => {
    try {
        const coupen1 = await coupenSchema.find({})
        const coupen = await coupenSchema.updateOne({
        }, { $set: { to: { $toDecimal: '$to' } } },);

        console.log(coupen)
        res.send(coupen1)
        if (12 <= 128 && 180 >= 12) {
            res.send(true)
        } else {
            res.send(false)

        }
        res.render('check')


    } catch (err) {
        console.log(err.message + '     check route')
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
        dataExist.coupens.forEach((e) => {
            if (e.ID == id) {
                offer = e.coupenId.offer
            }
        })
        req.session.offer = offer
        if (dataExist) {
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
        if (gg < page) {
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
            const data = await productModal.find({ $or: [{ name: { $regex: content } }, { description: { $regex: content } }, { createdAt: { $regex: content } }] }).populate('category offer').exec()
            const cat = await categoryModal.find({ $or: [{ name: { $regex: content } }, { gender: { $regex: content } }] })
            console.log(cat)
            const result = data.concat(cat)
            res.send({ result })

        } else {
            const result = await productModal.find({ $or: [{ price: req.body.val }, { stock: req.body.val }] }).populate('category offer').exec()
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
            const le = await productModal.find({ $or: [{ name: { $regex: content } }, { description: { $regex: content } }, { createdAt: { $regex: content } }] }).populate('category offer').exec()
            const product = await productModal.find({ $or: [{ name: { $regex: content } }, { description: { $regex: content } }, { createdAt: { $regex: content } }] }).populate('category offer').skip((perPage * page) - perPage)
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
                const g = await productModal.find({ category: e._id });
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
            res.status(200).json({ data:product })
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
            for (let i = 0; i < data1[0].productData.length; i++) {
                let val = await productModal.findOne({ _id: data1[0].productData[i]._id }).populate('category offer');
                data.push(val)
            }
            const f = (perPage * page) - perPage;
            const product = data.slice(f, f + perPage)
            res.status(200).json({ data:product })
        } else if (req.query.val == 'cheapest') {
            const data = await productModal.find({}).sort({ price: 1 }).populate('category offer')
            const f = (perPage * page) - perPage;
            const product = data.slice(f, f + perPage)
            res.status(200).json({ data:product })
        } else if (req.query.val == 'premium') {
            const data = await productModal.find({}).sort({ price: -1 }).populate('category offer')
            const f = (perPage * page) - perPage;
            const product = data.slice(f, f + perPage)
            res.status(200).json({ data:product })
        } else {
            res.status(400).json({ err: 'errr' })
        }
    } catch (err) {
        console.log(err.message + ' shopFilter')
    }
}

module.exports = {
    signUp,
    getSignUp,
    home,
    otp,
    gettingOtp,
    shop,
    emailExist,
    getLogin,
    profile,
    resubmit,
    resend,
    forgetPassword,
    forgetemailExist,
    forget,
    newPass,
    getNewPass,
    logout,
    productDets,
    cart,
    wishlist,
    addcart,
    cartEdit,
    cartree,
    adress,
    getadress,
    patchaddress,
    removeadress,
    addcartPost,
    checkoutPage,
    Defaddress,
    success,
    postSucces,
    orderDet,
    orderView,
    editOrder,
    check,
    razor,
    invoice,
    changePassword,
    changePasswordpost,
    editprofile,
    coupenView,
    coupenCode,
    catgory,
    search,
    searchItem,
    shopFilter,
    wishListAdd,
    wishListRemove,
    cartCount
}