const mongoose = require("mongoose")

const tokenSchema = mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        requied: true,
        ref: 'User'
    },
    token:{
        type: String,
        required: true
    },
    createdAt:{
        type: Date,
        required: true,
    },
    expiredAt:{
        type: Date,
        required: true,
    }

})

const Token = mongoose.model('Token', tokenSchema)
module.exports = Token