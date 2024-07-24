const mongoose = require('mongoose')


const userDetailsSchema = new mongoose.Schema({
    emailID: {
        type: String
    },
    password: {
        type: String
    },
    user_name: {
        type: String
    },
    role:{
        type:String
    },
    mobilenumber:{
        type:String
    },
    createdAt:{
        type: Date, 
        default: Date.now 
    }
}, {versionKey: false})

const User = mongoose.model('UserDetails', userDetailsSchema)

module.exports =  {User} 