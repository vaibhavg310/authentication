const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

const protect = asyncHandler(async (req, res, next) => {

    try{
        const token = req.cookie.token;
        if(!token){
            res.status(401);
            throw new Error('Not authorized, no token');
        }

        //verify token

        const verified = jwt.verify(token, process.env.JWT_SECRET);

        // get user id from token
        const user = await User.findById(verified.id).select('-password');
        
        if(!user){
            res.status(401);
            throw new Error('Not authorized, no user');
        }

        req.user = user;
        next();

    }
    catch(error){
        res.status(401);
        throw new Error('Not authorized, please login');
    
    }
})

module.exports = protect;