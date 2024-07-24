const mongoose = require('mongoose')


const serviceDetailsSchema = new mongoose.Schema({
    name:String,
    email:String,
    phoneNo:String,
    serviceName: String,
    details: String,
    
    createdAt:{
        type: Date, 
        default: Date.now 
    }
}, {versionKey: false})

const Service = mongoose.model('ServiceDetails', serviceDetailsSchema)

module.exports = {Service} 