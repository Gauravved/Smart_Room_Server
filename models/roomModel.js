const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
    roomname: {
        type: String,
        required: true
    },
    activityStatus: {
        type: Boolean,
        default: true
    },
    allowedUsers: {
        type: Array,
        default: []
    }
});

module.exports.roomSchema = mongoose.model("Rooms",roomSchema);