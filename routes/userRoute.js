
const { register, login, profile,forgotPassword, resetPassword, getRooms, createRoom, deleteRoom, joinRoom, addMember } = require('../controllers/userController');
const router = require('express').Router();
// we are creating a router from express that will listen to the request comming from the /register path and then sending to 
// register function written in userController  
router.post("/register", register); 
router.post("/login", login);
router.post("/setProfile/:id",profile);
router.post("/forgotPassword", forgotPassword);
router.post('/resetPassword/:id/:token',resetPassword);
router.get('/allRooms/:id',getRooms);
router.post('/createRoom/:id',createRoom);
router.post('/deleteRoom/:id',deleteRoom);
router.post('/joinRoom/:id', joinRoom);
router.post('/addMember/:id', addMember)
console.log("Hello")
module.exports = router;