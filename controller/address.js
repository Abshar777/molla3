const userSchema = require("../models/userSchema");
const categoryModal = require('../models/catagory')
const addressModal = require('../models/adress')
require('dotenv').config();



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

module.exports = {
    adress,
    getadress,
    patchaddress,
    removeadress,
    Defaddress,
}