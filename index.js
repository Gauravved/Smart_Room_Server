const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoute = require('./routes/userRoute');
const messageRoute = require('./routes/messageRoute');
const socket = require('socket.io');
const User = require('./models/userModel').userModel; 
const path = require('path');
// const webSocketPort = 8000
// const webSocketServer = require('websocket').server;
const http = require('http');
// const { WebSocketServer } = require('ws');


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
app.use('/',(req,res,next)=>{
    res.json({data: "Server is running"});
})
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(()=>{
    console.log("Database Connected");
}).catch((err)=>{
    console.log(err.message);
});
const server = http.createServer(app);
server.listen(process.env.PORT,()=>{
    console.log(`Server Started at ${process.env.PORT}`);
});
// const wsServer = new WebSocketServer({
//     httpServer: process.env.PORT
// })
const io = socket(server, {
    cors:{
        origin: 'https://smart-room-chat.herokuapp.com',
        credential: true
    }
});


global.onlineUsers = new Map();

io.on('connection',(socket)=>{
    socket.on('add-user',(userId)=>{
        onlineUsers.set(userId, socket.id);
        console.log("User added "+userId);
    });
    socket.on('send-msg', (data)=>{
        const userName = getUserName(data.from);
        console.log("Message sending");
        const sendSocketUser = [];
        for(let i=0;i<data.to.length;i++){
            sendSocketUser.push(onlineUsers.get(data.to[i]));
            console.log(data.to[i]+sendSocketUser);
        }
        console.log(data.receiverRoomId);
        io.to(receiverRoomId).emit('msg-receive', {message: data.message, receiverRoomId: data.receiverRoomId, to: data.to[i], from: userName});
        // for(let i = 0;i<sendSocketUser.length;i++){
        //     console.log("sent to ",data.to[i]);
        //     socket.to(data.to[i]).emit('msg-receive', {message: data.message, receiverRoomId: data.receiverRoomId, to: data.to[i], from: userName});
        // }

    })
});

async function getUserName(userId) {
    const user = await User.findById(userId).select(['username']);
    return user.username;
}
