const express = require('express');
const { 
    registerUser , 
    loginUser, 
    logout,
    getUser,
    loginStatus
         } = require('../controllers/userController');
const protect = require('../middleWare/authMiddleware');
const router = express.Router();


router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logout);
router.post('/getuser', protect, getUser)
router.post('/loggedin', loginStatus)

module.exports = router;