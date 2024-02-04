const userSchema = require("../models/userSchema");
const categoryModal = require('../models/catagory')
const productModal = require('../models/products');
const path = require('path');
const fs = require('fs')
const orderModal = require('../models/orders')
const addressModal = require('../models/adress')
const bycrypt = require('bcrypt');
const dotEnv = require('dotenv');
const options = { day: '2-digit', month: 'short', year: 'numeric' };

//admin page rendering
const adminPage = async (req, res) => {
    try {
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
            },{
                $limit:5
            }

        ])

        res.render('admin/dashboard', { admin: req.session.admin, home: 'home', most, orderList, count, op, cod })
    } catch (err) {
        console.log(err.message + '     admin first route');
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
        const users = await userSchema.find({ is_admin: 0 })

        res.render('admin/userList', { admin: req.session.admin, users, user: 'user' })


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
        const name = await categoryModal.findOne({ name: req.body.name })
        console.log(name);
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
        console.log(req.query.id)
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
        })
        res.redirect('/admin/product')
    } catch (err) {
        console.log(err.message + '         product add')
    }
}

//product dets page rendering
const productDets = async (req, res) => {
    try {

        const products = await productModal.find({}).populate('category')

        const ca = await categoryModal.find({})
        res.render('admin/products', { admin: req.session.admin, product: products, ca })
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
        console.log(oldData)
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
                console.log(`${e} deleted`);
            } else {
                console.log(`${e} does not exist`);
            }
        });
        if (don) {
            res.redirect('/admin/product');
        }
    } catch (err) {
        console.log(err.message + '       dlt product')
    }
}

//order 
const order = async (req, res) => {
    try {
        const orderList = await orderModal.find({}).populate('userId');

        if (orderList) {
            res.render('admin/orderDets', { admin: req.session.admin, order: true, orderList })
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

//order status fethibg
const orderstaus = async (req, res) => {
    try {
        await orderModal.findOneAndUpdate({})
    } catch (err) {
        console.log(err.message + '   oder staus ')
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
        await orderModal.findOneAndUpdate({ _id: req.body.id, 'OrderedItems.productId': req.body.proId }, { $set: { 'OrderedItems.$.orderProStatus': req.body.val } })
    } catch (err) {
        console.log(err.message + ' orderProstatus')
    }
}


module.exports = {
    adminPage,
    productAdd,
    users,
    blockFetch,
    catgoryAdd,
    productDets,
    category,
    categoryFetch,
    getcatgoryAdd,
    categorydlt,
    catgoryActive,
    getproduct,
    editProduct,
    dltPro,
    order,
    removeorder,
    orderView,
    removeordeFull,
    orderProstatus,
    peyment
}