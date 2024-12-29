const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    id:{
        type:Number,
        required:true,
        unique:true
    },
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    creatorID:{
        type:Number,
        required:true
    },
    createdAt:{
        type:Date,
        required:true
    },
    status:{
        type:String,
        required:true
    }
})

module.exports = mongoose.model('Product', productSchema)