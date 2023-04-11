const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter your name'],

    },
    email: {
        type: String,
        required: [true, 'Please enter your email'],
        unique: true,
        trim: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please enter a valid email address'
        ]   
    },

    password: {
        type: String,
        required: [true, 'Please enter your password'],
        minlength: [6, 'Minimum password length is 6 characters']
    },
    
    photo:{
        type: String,
        required: [true, 'Please upload a profile photo'],
        default: "https://i.ibb.co/4pDNDk1/avatar.png"
    },
    phone: {
        type: String,
        default: "+91" 
    },
    bio: {
        type: String,
        maxlLength: [200, 'Bio cannot exceed 200 characters'],
        default: "bio"
    },


},
{
    timestamps: true
})

//  Encrypt password before saving to db
userSchema.pre('save', async function(next){
    if(!this.isModified('password')){
       return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next(); 
})


const User = mongoose.model('User', userSchema);
module.exports = User;