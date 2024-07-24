const mongoose = require('mongoose')


const bookingDetailsSchema = new mongoose.Schema({
    UserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
    bookingDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'ready', 'completed'], default: 'pending' }
}, {versionKey: false})

const Booking = mongoose.model('BookingDetails', bookingDetailsSchema)

module.exports =  {Booking} 