const mongoose = require('mongoose')

const roleSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    permissions:{
        type:Array,
        required:true
    }
})

module.exports = mongoose.model('Role', roleSchema)