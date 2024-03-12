const userSchema = require("../models/userSchema");
const categoryModal = require('../models/catagory')
const bycrypt = require('bcrypt');
require('dotenv').config();
const verifyemail = require('../config/verifyemail')
const securePassword = require('../util/scurePassword')
const generateOTP = require('../util/generateOtp')



// date setup
const options = { day: '2-digit', month: 'short', year: 'numeric' };

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

        let emailcheck = await userSchema.findOne({ email: req.body.payload })

        if (emailcheck) {

            res.send({ emailExist: 'email exist already' })
        }
        else {
            res.send({ note: 'email exist already' })
        }
    } catch (err) {
        console.log(err.message + '          email checking route')
        res.status(500)
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
            res.status(500)
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
            const cetgory = await categoryModal.find({})
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

module.exports = {
    signUp,
    getSignUp,
    otp,
    gettingOtp,
    emailExist,
    getLogin,
    resubmit,
    resend,
    forgetPassword,
    forgetemailExist,
    forget,
    newPass,
    getNewPass,
}