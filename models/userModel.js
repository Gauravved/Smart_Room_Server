const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        min: 5
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
    },
    password: {
        type: String,
        min: 8,
        required: true
    },
    isProfilePicSet: {
        type: Boolean,
        default: false,
    },
    ProfilePic:{
        type: String,
        default: ""
    },
    Rooms:{
        type: Array,
        default: []
    }
});

module.exports.userModel = mongoose.model("Users", userSchema);