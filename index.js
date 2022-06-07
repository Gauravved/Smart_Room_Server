const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoute = require('./routes/userRoute');
const messageRoute = require('./routes/messageRoute');
const socket = require('socket.io');
const User = require('./models/userModel').userModel; 
const path = require('path');
const SERVER_PORT = 8087; 
var WebSocketServer = require('ws').Server , wss = new WebSocketServer({port :8087});

const app = express();
require('dotenv').config();
app.use(cors());
app.options('*',cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.all('/*',function(req, res, next) {
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods","GET, POST, PUT, PATCH, DELETE, OPTIONS");
    next();   
});
// app.use(express.static(path.join(__dirname + '/public'+'/build')));

// app.use('/', (req,res,next)=>{
//     res.sendFile('./public/build');
// })
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods","GET, POST, PUT, PATCH, DELETE, OPTIONS");
    next();   
});
app.use('/api/auth', userRoute);
app.use('/api/message', messageRoute);

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(()=>{
    console.log("Database Connected");
}).catch((err)=>{
    console.log(err.message);
});
const server = app.listen(process.env.PORT, ()=>{
    console.log("Server at Port:"+process.env.PORT);
});

const io = socket(server, {
    cors:{
        origin: "https://smart-room-chat.herokuapp.com",
        credentials: true
    }
})


global.onlineUsers = new Map();

io.on("connection",(socket)=>{
    global.chatSocket = socket,
    socket.on("add-user",(userId)=>{
        onlineUsers.set(userId, socket.id);
        console.log("added", userId);
    });
    socket.on("send-msg",async (data)=>{
        socket.join(data.receiverRoomId)
        const user = await User.findById(data.from).select(["username"]);
        const userName = user.username;
        const sendUserSocket = [];
        for(let i=0;i<data.to.length;i++){
            sendUserSocket.push(onlineUsers.get(data.to[i]));
        }
        // socket.to(data.receiverRoomId).emit("msg-receive", {message: data.message, from: userName});
        console.log(data.receiverRoomId);
        for(let i=0;i<sendUserSocket.length;i++){
            if(sendUserSocket[i]){
                socket.to(sendUserSocket[i]).emit("msg-receive", {message: data.message, receiverRoomId: data.receiverRoomId, to: data.to[i], from: userName});
            }
        }
    })
});

