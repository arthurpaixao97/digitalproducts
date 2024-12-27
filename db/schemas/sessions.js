const mongoose = require('mongoose')

const sessionSchema = new mongoose.Schema({
    token:{
        type:String,
        required:true,
        unique:true
    },
    user:{
        type:Number,
        required:true
    },
    role:{
        type:String,
        required:true
    },
    expires:{
        type:Date,
        required:true
    }
})

module.exports = mongoose.model('Session', sessionSchema)