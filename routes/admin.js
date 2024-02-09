const express = require('express');
const router = express.Router();
const userModal=require('../models/userSchema')
const adminController=require('../controller/adminController')
const adminMidleware=require('../middleware/admin');
const path = require('path');
const multer=require('multer');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/productImage'));
  },
  filename: (req, file, cb) => {
    const name = Date.now() + ' - ' + file.originalname;
    cb(null, name);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
  
    cb(null, true);
  },
});



// router.get('/',adminController.adminLogin)

//admin dashborad page rendering
router.get('/',adminMidleware.adminRoute,adminController.adminPage)

//product dets page rendering
router.get('/product',adminMidleware.adminRoute,adminController.productDets)

//product add route
router.get('/productAdd',adminMidleware.adminRoute,adminController.productAdd);


// user list showing 
router.get('/users',adminMidleware.adminRoute,adminController.users)

//fetching the data
router.post('/user',adminController.blockFetch)

// catagory page rendering
router.get('/catagory',adminMidleware.adminRoute,adminController.category)

// /categoryFetch 
router.post('/categoryFetch',adminMidleware.adminRoute,adminController.categoryFetch)

// catgory add page rendering
router.get('/catagoryAdd',adminMidleware.adminRoute,adminController.catgoryAdd)

// getting category dets
router.post('/catgoryAdd',adminMidleware.adminRoute,adminController.getcatgoryAdd);

// remove category
router.get('/Catremove',adminMidleware.adminRoute,adminController.categorydlt);

//  category active or not fecting
router.post('/activeOrnot',adminController.catgoryActive);

//getting product
router.post('/productAdd',upload.array('images', 3),adminController.getproduct)

// edi route
router.post('/edit',upload.fields([{ name: 'images0', maxCount: 1 },{ name: 'images1', maxCount: 1 },{ name: 'images2', maxCount: 1 }]),adminController.editProduct)

//dlt product
router.get('/dltProduct',adminController.dltPro)

//order status changing
router.put('/orderStatus',adminController.orderProstatus);

//remove order product
router.put('/removeorder',adminController.removeorder)

//remove order full
router.patch('/removeorder',adminController.removeordeFull)

//order list 
router.get('/orders',adminMidleware.adminRoute,adminController.order)

//order view
router.get('/ordersView/:id',adminMidleware.adminRoute,adminController.orderView)

//peyment chart fetching
router.put('/peyment',adminController.peyment)

//yaer fetching
router.put('/year',adminController.year)

//sales report in yearly and monthly and weekly
router.get('/report/:id',adminMidleware.adminRoute,adminController.report)

//sales report in yearly and monthly and weekly
router.post('/report/download/:id',adminController.reportdownload)

//report custom
router.put('/report',adminController.customreport)

module.exports=router;