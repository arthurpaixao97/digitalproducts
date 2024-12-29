const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    id:{
        type:Number,
        required:true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    role:{
        type:String,
        required:true
    },
    permissions:Array,
    sanctions:Array
})

module.exports = mongoose.model('User', userSchema)