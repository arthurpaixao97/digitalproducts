const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
    productID: {
        type: Number,
        required: true
    },
    key: {
        type:String,
        required:true,
        unique:true
    },
    createdAt: {
        type:Date,
        required: true
    },
    currency: {
        type:String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    payment: {
        model:{
            type:String, //'SINGLE', 'SUBSCRIPTION', 'INSTALLMENT'
            required: true
        },
        frequency: {
            type:Number,//In days. 0 is single
            required: true
        },
        limit: {
            type:Number,//Limit of recurrences. -1 until cancellation, 0 single, >=1 limited
            required: true
        }
    },
    status: {
        type:String,
        required:true
    }
});

module.exports = mongoose.model('Offer', offerSchema);