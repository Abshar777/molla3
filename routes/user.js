const express = require('express');
const router = express.Router();
const userController=require('../controller/userControlller')
const userMidleware=require('../middleware/user');
const changeassMiddlware=require('../middleware/changePass')

// get home page
router.get('/',userMidleware.userbloack,userController.home);

//login page rendering
router.get('/login',userMidleware.loginTrue,userController.signUp);

//email exist checking
router.post('/login',userController.emailExist);

//post login
router.post('/sign-up',userController.getSignUp)

//otp
router.get('/otp',userMidleware.loginTrue,userController.otp)

//resend the otp
router.get('/resend',userController.resend)

//otp getting
router.post('/otp',userController.gettingOtp)

//resubmit the email in otp
router.post('/resubmit',userController.resubmit)

//forgetPassword
router.get('/forgetPassword',userMidleware.loginTrue,userController.forgetPassword);

//forgetpass fetching
router.post('/forgetPass',userController.forgetemailExist)

//forget redirecting to otp
router.post('/forget',userController.forget);

// enter the new password and upadating 
router.get('/newPass',userController.newPass)

// get new pass
router.post('/newPass',userController.getNewPass)

//getting login details
router.post('/sign-in',userController.getLogin)

//shop route 
router.get('/shop',userMidleware.userbloack,userController.shop)

//profile route
router.get('/profile',userMidleware.userbloack,userMidleware.user,userController.profile);

//profile route
router.get('/productDets',userMidleware.userbloack,userController.productDets);

//CART PAGE RENDERING route
router.get('/cart',userMidleware.userbloack,userMidleware.user,userController.cart);

//CART PAGE RENDERING route
router.get('/wishlist',userMidleware.userbloack,userMidleware.user,userController.wishlist);

//cart count
router.put('/cartCount',userController.cartCount)

// add cart fetching
router.put('/addcart',userController.addcart)

//ad cart on post requuser
router.post('/addcart',userController.addcartPost)

//cart stock increasing fetching 
router.put('/cartUpdate',userController.cartEdit)

//deleate cart 
router.delete('/cartremove',userController.cartree)

//wishlist remove
router.delete('/wishListRemove',userController.wishListRemove)

//adress route
router.get('/adress',userMidleware.userbloack,userMidleware.user,userController.adress);

// getting addresss
router.post('/adress',userController.getadress)

//fetching adress exists or note 
router.put('/address',userController.patchaddress)

//remove address
router.delete('/address',userController.removeadress)

//checkout page router
router.get('/checkoutPage',userMidleware.userbloack,userMidleware.user,userController.checkoutPage)

// defulat address fetching
router.put('/Defaddress',userController.Defaddress)

// succes msg rendering
router.get('/success',userMidleware.userbloack,userMidleware.user,userController.success)

//succes post route
router.post('/success',userController.postSucces)

//  order det page rendering
router.get('/order',userMidleware.userbloack,userMidleware.user,userController.orderDet)

//  order det page rendering
router.get('/orderView/:id',userMidleware.userbloack,userMidleware.user,userController.orderView)

//order canceling 
router.put('/editOrder',userController.editOrder)

//chacking route
router.get('/check',userController.check)

//razor pay fetching
router.post('/razor',userController.razor)

//invoice download
router.get('/invoice/:id',userController.invoice)

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
router.post('/wishListAdd',userController.wishListAdd)

//logout
router.post('/logout',userController.logout)




module.exports = router;
