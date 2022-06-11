const { userModel } = require('../models/userModel');
const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);
const Message = require('../models/messageModel').messageSchema;


module.exports.addMessage = async (req, res, next)=>{
    try {
        console.log("Hello");
        const { from, to, message } = req.body;
        let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
        let encrypted = cipher.update(message);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        const data = await Message.create({
            message: {text: {iv: iv.toString('hex'), encryptedData: encrypted.toString('hex'), key: key.toString('hex')}},
            users: [from, to],
            sender: from,
            receiver: to
        });
        if(data){
            return res.json({msg: "Message added Successfully", data: data, roomName: req.body.name });
        }
        else{
            return res.json({msg: " Failed to add Message"})
        }
    } catch (error) {
        next(error)
    }
}
module.exports.getMessages = async (req, res, next)=>{
    try {
        const { from, to } = req.body;
        const messages = await Message.find({
            receiver: {$all : to}
        })
        .sort({updatedAt: 1});
        let array = [];
        let decryptedMessages = [];
        for(let i = 0;i< messages.length;i++){
            const user = await userModel.findById(messages[i].sender);
            const username = user.username;
            let iv = Buffer.from(messages[i].message.text.iv, 'hex');
            let encryptedText = Buffer.from(messages[i].message.text.encryptedData, 'hex');
            let enKey = Buffer.from(messages[i].message.text.key,  'hex');;
            let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(enKey), iv);
            let decrypted = decipher.update(encryptedText);
            decrypted = Buffer.concat([decrypted, decipher.final()]);
            const decrypt = decrypted.toString();
            decryptedMessages.push(decrypt);
            array.push(username);
        }
        const projectMessage = messages.map((msg, index)=>{
            return{
                fromSelf: msg.sender.toString() === from? true : array[index],
                message: decryptedMessages[index],
            }
        });
        res.json(projectMessage);
    } catch (error) {
        next(error)
    }
}