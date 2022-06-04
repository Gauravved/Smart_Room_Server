
const { addMessage, getMessages } = require('../controllers/messageController');
const router = require('express').Router();
// we are creating a router from express that will listen to the request comming from the /register path and then sending to 
// register function written in messageController  
router.post("/addmessage", addMessage); 
router.post("/getMessage", getMessages);
console.log("Hello")
module.exports = router;