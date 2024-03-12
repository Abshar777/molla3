const express = require('express');
const router = express.Router();
const userController=require('../controller/userControlller')
const userMidleware=require('../middleware/user');
const changeassMiddlware=require('../middleware/changePass')
const userHelper=require('../controller/userHelp');
const wishlistAndCart=require('../controller/wishListAndCart')
const addresController=require('../controller/address');
const orderController=require('../controller/userOrder')

// get home page
router.get('/',userMidleware.userbloack,userController.home);

//login page rendering
router.get('/login',userMidleware.loginTrue,userHelper.signUp);

//email exist checking
router.post('/login',userHelper.emailExist);

//post login
router.post('/sign-up',userHelper.getSignUp)

//otp
router.get('/otp',userMidleware.loginTrue,userHelper.otp)

//resend the otp
router.get('/resend',userHelper.resend)

//otp getting
router.post('/otp',userHelper.gettingOtp)

//resubmit the email in otp
router.post('/resubmit',userHelper.resubmit)

//forgetPassword
router.get('/forgetPassword',userMidleware.loginTrue,userHelper.forgetPassword);

//forgetpass fetching
router.post('/forgetPass',userHelper.forgetemailExist)

//forget redirecting to otp
router.post('/forget',userHelper.forget);

// enter the new password and upadating 
router.get('/newPass',userHelper.newPass)

// get new pass
router.post('/newPass',userHelper.getNewPass)

//getting login details
router.post('/sign-in',userHelper.getLogin)

//shop route 
router.get('/shop',userMidleware.userbloack,userController.shop)

//profile route
router.get('/profile',userMidleware.userbloack,userMidleware.user,userController.profile);

//profile route
router.get('/productDets',userMidleware.userbloack,userController.productDets);

//CART PAGE RENDERING route
router.get('/cart',userMidleware.userbloack,userMidleware.user,wishlistAndCart.cart);

//CART PAGE RENDERING route
router.get('/wishlist',userMidleware.userbloack,userMidleware.user,wishlistAndCart.wishlist);

//cart count
router.put('/cartCount',wishlistAndCart.cartCount)

// add cart fetching
router.put('/addcart',wishlistAndCart.addcart)

//ad cart on post requuser
router.post('/addcart',wishlistAndCart.addcartPost)

//cart stock increasing fetching 
router.put('/cartUpdate',wishlistAndCart.cartEdit)

//deleate cart 
router.delete('/cartremove',wishlistAndCart.cartree)

//wishlist remove
router.delete('/wishListRemove',wishlistAndCart.wishListRemove)

//adress route
router.get('/adress',userMidleware.userbloack,userMidleware.user,addresController.adress);

// getting addresss
router.post('/adress',addresController.getadress)

//fetching adress exists or note 
router.put('/address',addresController.patchaddress)

//remove address
router.delete('/address',addresController.removeadress)

//checkout page router
router.get('/checkoutPage',userMidleware.userbloack,userMidleware.user,orderController.checkoutPage)

// defulat address fetching
router.put('/Defaddress',addresController.Defaddress)

// succes msg rendering
router.get('/success',userMidleware.userbloack,userMidleware.user,orderController.success)

//succes post route
router.post('/success',orderController.postSucces)

//  order det page rendering
router.get('/order',userMidleware.userbloack,userMidleware.user,orderController.orderDet)

//  order det page rendering
router.get('/orderView/:id',userMidleware.userbloack,userMidleware.user,orderController.orderView)

//order canceling 
router.put('/editOrder',orderController.editOrder)

//razor pay fetching
router.post('/razor',orderController.razor)

//invoice download
router.get('/invoice/:id',orderController.invoice)

//change password
router.get('/changpass',changeassMiddlware.changePass,userController.changePassword)

//invoice download
router.post('/changpass',userController.changePasswordpost);

//edit profile
router.post('/edit/:id',userController.editprofile);

//coupen code posting
router.post('/coupenCode/:id',userController.coupenCode);

//  order det page rendering
router.get('/coupen',userMidleware.userbloack,userMidleware.user,userController.coupenView)

//  category list showing
router.get('/cetgory/:id',userMidleware.userbloack,userController.catgory)

//seach suggetions
router.get('/search',userController.search)

//search result
router.get('/searchItem',userMidleware.userbloack,userController.searchItem)

//filter shop
router.post('/shop/filter',userController.shopFilter)

//wishList adding beckend
router.post('/wishListAdd',wishlistAndCart.wishListAdd)

//wallet transation 
router.get('/walletHistory',userMidleware.userbloack,userMidleware.user,orderController.walletHistory)

//about 
router.get('/about',userController.about)

//faq
router.get('/faq',userController.faq)

//logout
router.post('/logout',userController.logout)

//catch all
router.get('/404',userController.catchAll)



module.exports = router;
