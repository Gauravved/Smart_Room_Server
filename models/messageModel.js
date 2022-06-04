const mongoose = require("mongoose");
const messageSchema = new mongoose.Schema({
    message: {
        text: {
            iv:{
                type: String,
                required: true
            },
            encryptedData:{
                type: String,
                required: true
            },
            key:{
                type: String,
                required:  true
            }
        }
    },
    users: Array,
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true
    },
    receiver:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Rooms",
        required:true
    }
},
{
       timestamps: true
});

module.exports.messageSchema = mongoose.model("Messages", messageSchema);