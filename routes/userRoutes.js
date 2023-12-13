const express = require('express');

const  userController = require('./../controllers/userController');
const  authController = require('./../controllers/authController');

const router = express.Router();

router.post('/signUp', authController.signUp);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

//All the routes which is coming under this section will execute this middleware first
router.use(authController.protect);

router.patch('/updatePassword/:id', authController.updatePassword);
router.patch('/updateMyself/:id' , userController.updateMe);
router.delete('/deleteUser/:id', authController.restricTo('admin' ,'lead-guide'),userController.deleteUser);

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
 // .delete(authController.protect, authController.restricTo('admin' ,'lead-guide'),userController.deleteUser);


  module.exports = router;