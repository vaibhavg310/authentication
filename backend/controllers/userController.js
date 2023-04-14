 const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Token = require('../models/tokenModel');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');


const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: '1d'
    })

}
//register user
const registerUser = asyncHandler (async (req, res) => {
  
    const { name, email, password } = req.body; 
    
    //validation
    if(!name || !email|| !password){
        res.status(400);
        throw new Error('Please fill all fields');
    }
    if(password.length < 6){
        res.status(400);
        throw new Error('Password must be at least 6 characters');
    }

    //check if user email already exists
    const userExists = await User.findOne({ email });
    
    if(userExists){
        res.status(400);
        throw new Error('Email has already been registered');
    }

    

    //create new user\
    const user = await User.create({
        name,
        email,
        password

    })

    //Generate token

    const token = generateToken(user._id);
    
    //send HTTP-only cookie 
    res.cookie('token', token, {
        path: '/',
        httpOnly: true,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        sameSite: 'none',
        secure: true
    })
     
    if (user) {
        const {_id, name, email, photo, phone, bio} = user;
            res.status(201).json({
            _id,
            name,
            email,
            photo,
            phone, 
            bio,
            token
        })
    }
    else{
        res.status(400);
        throw new Error('Invalid user data');
    }


})

// Login User
const loginUser = asyncHandler( async (req, res) => {
    console.log(res.status);
 const { email, password } = req.body;

    //validation
    if(!email|| !password){
        
        res.status(400);
        throw new Error('Please add email and password');
    }
    // check if user exists
    const user  = await User.findOne({ email });
    if(!user){
       
        res.status(400);
        throw new Error('user not found please sign up');
    }

    //user exists, check if password matches
    const passwordIsCorrect = await bcrypt.compare(password, user.password);

    const token = generateToken(user._id);
    
    //send HTTP-only cookie 
    res.cookie('token', token, {
        path: '/',
        httpOnly: true,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        sameSite: 'none',
        secure: true
    })


    if (user && passwordIsCorrect){
        const { _id, name, email, photo, phone, bio } = user;
        
        res.status(200).json({
            _id,
            name,
            email,
            photo,
            phone,
            bio,
            token
        })
}
    else{
       
        res.status(400);
        throw new Error('Invalid email or password');
    }
})



//logout user
const logout = asyncHandler( async (req, res) => {
  res.cookie('token', '', {
      path: '/',
      httpOnly: true,
      expires: new Date(0),
      sameSite: 'none',
      secure: true
  })
   return res.status(200).json({
      message: 'Logged out successfully'
   })
})

// get user data
const getUser = asyncHandler( async (req, res) => {

   const user = await User.findById(req.user._id);
    if(user){
        const { _id, name, email, photo, phone, bio } = user;
        res.status(200).json({
            _id,
            name,
            email,
            photo,
            phone,
            bio
        })
        
    }
    else{
        res.status(404);
        throw new Error('User not found');
    }
})

// get login status
const loginStatus = asyncHandler( async (req, res) => {
  const token = req.cookies.token;
    if(!token){
        return res.json(false)
    } 
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if(verified){
        return res.json(true)
    }
    return res.json(false);
})

//Update user
const updateUser = asyncHandler( async (req, res) => {
    const user = await User.findById(req.user._id);
    if(user){
        const {  name, email, photo, phone, bio } = user;
        user.email =  email;
        user.name = req.body.name || name;
        user.phone = req.body.phone || phone;
        user.bio = req.body.bio || bio;
        user.photo = req.body.photo || photo;

        const updatedUser = await user.save();

        res.status(200).json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            photo: updatedUser.photo,
            phone: updatedUser.phone,
            bio: updatedUser.bio
        })

    }else{
        res.status(404);
        throw new Error('User not found');
    }
})

const changePassword = asyncHandler( async (req, res) => {
  const user = await User.findById(req.user._id);

  const { oldPassword, newPassword } = req.body;

  if(!user){
        res.status(404);
        throw new Error('User not found please sign up');
  }

  //validate
    if(!oldPassword || !newPassword){
        res.status(400);
        throw new Error('Please fill old and new password fields');
    }
    if(newPassword.length < 6){
        res.status(400);
        throw new Error('Password must be at least 6 characters');
    }
        //check if old password matches password in database
        const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password);

        //save new password
        if (user && passwordIsCorrect){
            user.password = newPassword;
            const updatedUser = await user.save();
            res.status(200).send('Password updated successfully');
        }
        else{
            res.status(400);
            throw new Error('Invalid old password');
        }
})

const forgotPassword = asyncHandler( async (req, res) => {
   const { email } = req.body;
   const user = await user.findOne({ email });
    if(!user){
        res.status(404);
        throw new Error('User does not exist');
    }

   // delete token if it exists in DB
   let token = await Token.findOne({ userId: user._id });
   if(token){
    await token.deleteOne();
   }

    //create reset token

    const resetToken = crypto.randomBytes(32).toString('hex') + user._id
     //hash token before saving tp DB
     const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

     //SAVE TOKEN TO DB
     await new Token({
            userId: user._id,
            token: hashedToken,
            createdAt: Date.now(),
            expiresAt: Date.now() + 30 * (60 * 1000) //30 minutes
        }).save();

        //construct reset url
        const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`

        //reset Email 
         const message =`
         
            <h2> Hello ${user.name}</h2>
            <p>please use the url below to reset your password </p>

            <a href=${resetUrl} clicktracking = off>${resetUrl}</a>
            <p> regards...</p>
            <p>Invento Track team</p>;
            `
         const subject = 'Password Reset Request';
         const send_to = user.email;
        const send_from = process.env.EMAIL_USER;

        //send email
       try{
        await sendEmail({ message, subject, send_to, send_from })
        res.status(200).json({success: true,
            message: 'Password reset link sent to your email'
       })
       }
         catch(err){
             res.status(500);
                throw new Error('Error sending email, please try again');
         }

        
    })

    // reset password 
    const resetPassword = asyncHandler( async (req, res) => {
        const { password} = req.body;
        const {resetToken} = req.params;
        
        //Hash token, then compare to token in DB
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        //find token in DB
        const userToken = await Token.findOne({ 
            token: hashedToken,
            expiresAt: { $gt: Date.now() } // checking token if it greater then the curret time

        }); 

        if(!userToken){
            res.status(400);
            throw new Error('Invalid or expired token');
        }

        //find user
        const user = await User.findById({_id : userToken.userId});
        user.password = password;
        await user.save();
        res.status(200).json({
            message: 'Password reset successful, pLease login to continue'
        })
        
    })


module.exports = {
    registerUser, 
    loginUser,
    logout, 
    getUser,
    loginStatus,
    updateUser,
    changePassword,
    forgotPassword,
    resetPassword
}