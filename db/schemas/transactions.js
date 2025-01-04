class cartItem
{
    productID;
    offerKey;
}

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const transactionSchema = new Schema({
    id: {
        type:String,
        required:true
    },
    offer: {
        type: String,
        required: true
    },
    buyer: {
        email:{
            type:String,
            required:true
        },
        document:{
            type:String
        }
    },
    currency:{
        type:String,
        required:true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required:true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        immutable:true
    },
    cart:[Object],
    isRecurrencePayment:{
        type:Boolean,
        required:true
    },
    recurrence: {
        codeReference:String,
        recurrencyReference:Number
    }
});

module.exports = mongoose.model('Transaction', transactionSchema);