const express = require('express');
const router = express.Router();
const userModal=require('../models/userSchema')
const adminController=require('../controller/adminController')
const productController=require('../controller/product')
const categoryController=require('../controller/category')
const orderController=require('../controller/order')
const coupenController=require('../controller/coupen')
const offerController=require('../controller/offer')
const reportController=require('../controller/report')
const adminMidleware=require('../middleware/admin');
const upload=require('../util/multer')
const bannerController=require('../controller/banner')



// router.get('/',adminController.adminLogin)

//admin dashborad page rendering
router.get('/',adminMidleware.adminRoute,adminController.adminPage)

//product dets page rendering
router.get('/product',adminMidleware.adminRoute,productController.productDets)

//product add route
router.get('/productAdd',adminMidleware.adminRoute,productController.productAdd);

router.get('/prodectDect',productController.productDet)

// user list showing 
router.get('/users',adminMidleware.adminRoute,adminController.users)

//fetching the data
router.post('/user',adminController.blockFetch)

// catagory page rendering
router.get('/catagory',adminMidleware.adminRoute,categoryController.category)

// /categoryFetch 
router.post('/categoryFetch',adminMidleware.adminRoute,categoryController.categoryFetch)

// catgory add page rendering
router.get('/catagoryAdd',adminMidleware.adminRoute,categoryController.catgoryAdd)

// getting category dets
router.post('/catgoryAdd',adminMidleware.adminRoute,categoryController.getcatgoryAdd);

// remove category
router.get('/Catremove',adminMidleware.adminRoute,categoryController.categorydlt);

//  category active or not fecting
router.post('/activeOrnot',categoryController.catgoryActive);

//getting product
router.post('/productAdd',upload.array('images', 3),productController.getproduct)

// edi route
router.post('/edit',upload.fields([{ name: 'images0', maxCount: 1 },{ name: 'images1', maxCount: 1 },{ name: 'images2', maxCount: 1 }]),productController.editProduct)

//dlt product
router.get('/dltProduct',productController.dltPro)

//order status changing
router.put('/orderStatus',orderController.orderProstatus);

//remove order product
router.put('/removeorder',orderController.removeorder)

//remove order full
router.patch('/removeorder',orderController.removeordeFull)

//order list 
router.get('/orders',adminMidleware.adminRoute,orderController.order)

//order view
router.get('/ordersView/:id',adminMidleware.adminRoute,orderController.orderView)

//peyment chart fetching
router.put('/peyment',adminController.peyment)

//yaer fetching
router.put('/year',adminController.year)

//sales report in yearly and monthly and weekly
router.get('/report/:id',adminMidleware.adminRoute,reportController.report)

//sales report in yearly and monthly and weekly
router.post('/report/download/:id',reportController.reportdownload)

//report custom
router.put('/report',reportController.customreport)

//coupen page rendering
router.get('/coupen',adminMidleware.adminRoute,coupenController.coupenPage)

//offer page rendering
router.get('/offer',adminMidleware.adminRoute,offerController.offerPage)

//coupen page rendering
router.post('/offer',offerController.offerCreating)

//offer product adding and removing
router.put('/offer/:id',offerController.offerProductAdd)

//offer product showing page rendering
router.get('/offerProduct/:id',adminMidleware.adminRoute,offerController.offerProduct)


//coupen page rendering
router.get('/addOffer',adminMidleware.adminRoute,offerController.addOfferPage);

//offer edit 
router.get('/offeredit/:id',adminMidleware.adminRoute,offerController.offerEdit);

//offer edit 
router.post('/offeredit/:id',adminMidleware.adminRoute,offerController.getofferEdit);

//offer edit 
router.get('/offerDeleat/:id',adminMidleware.adminRoute,offerController.offerdeleat);

//coupen page rendering
router.post('/coupen',upload.array('images'),coupenController.coupenCreating)

//coupen page rendering
router.delete('/coupenRemove/:id',coupenController.coupenRemove)

//coupen page rendering
router.post('/coupenEdit/:id',upload.array('images'),coupenController.coupenEdit);

//product status changing
router.put('/proStatus',productController.proStatus)

//banner showing route 
router.get('/banner',adminMidleware.adminRoute,bannerController.bannerPage)

//banner showing route 
router.post('/banner',upload.array('images'),bannerController.bannerDetGet)

module.exports=router;