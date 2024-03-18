const categoryModal = require('../models/catagory')
const productModal = require('../models/products');
const path = require('path');
const fs = require('fs');
const options = { day: '2-digit', month: 'short', year: 'numeric' };


// product add page
const productAdd = async (req, res) => {
    try {
        const category = await categoryModal.find({})
        res.render('admin/productAdd', { admin: req.session.admin, productAdd: 'prod', categoryList: category });
    } catch (err) {
        console.log(err.message + '     productadd route ')
        res.status(400).send({err:err.message})
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
        res.status(400).send({err:err.message})
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
        res.status(400).send({err:err.message})
    }
}

//product edit page 
const editProduct = async (req, res) => {
    try {
        const produt = await productModal.findOne({ _id: req.query.id });
        let imag = [];
        for (let i = 0; i < 3; i++) {
            const key = `k${i}`;
            if (req.body[key]) {
                imag.push(produt.images[i]);
            } else {
                imag.push(req.files[`images${i}`][0].filename);
                fs.unlinkSync(path.join(__dirname, '../public/productImage', produt.images[i]))
            }
        }
        const category_id = await categoryModal.findOne({ name: req.body.category })
         await productModal.findOneAndUpdate({ _id: req.query.id }, { $set: { name: req.body.name, price: req.body.price, stock: req.body.stock, category: category_id, images: imag,description:req.body.description } })
         res.redirect('/admin/product')
    } catch (err) {
        console.log(err.message + '      edit product routr')
        res.status(400).send({err:err.message})
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
        res.status(400).send({err:err.message})
    }
}

// product soft deleat
const proStatus = async (req, res) => {
    try {
        const product = await productModal.findOne({ _id: req.query.id });
        product.status = !product.status
        product.save();
        res.status(200).send({ su: 'succes' })
    } catch (err) {
        console.log(err.message + ' prostatus')
        res.status(400).send({err:err.message})
        res.status(500).send(err.message)
    }
}

//product det 
const productDet = async (req, res) => {
    try {
        const product = await productModal.findOne({ _id: req.query.id })
        res.status(200).send({ product })
    } catch (err) {
        res.status(400).send({ err: err.message })
    }
}

module.exports = {
    productAdd,
    getproduct,
    productDets,
    editProduct,
    dltPro,
    proStatus,
    productDet
}