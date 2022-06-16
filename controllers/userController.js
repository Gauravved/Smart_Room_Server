const User = require('../models/userModel').userModel;
const Room = require('../models/roomModel').roomSchema
const bcrypt = require('bcrypt'); // used for encrypting data. We have used to encrypt password
const jwt = require('jsonwebtoken');
const { default: mongoose } = require('mongoose');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');

// what to do with the request comming from /register path is decided here
module.exports.register = async (req, res, next) => {
    try {
        console.log(req.body);
        const { username, email, password } = req.body; // extracting data from request body
        const checkUser = await User.findOne({ username });
        if (checkUser) {
            return res.json({ msg: "Username already in use", status: false });
        }
        const checkMail = await User.findOne({ email });
        if (checkMail) {
            return res.json({ msg: "Email already in use", status: false });
        }
        const encryptedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            username, email, password: encryptedPassword
        }); //This will create the user and return the data of created user, hence we will delete the password for security purpose 
        delete user.password;
        res.json({ status: true, user });
    }
    catch (excpetion) {
        next(excpetion);
    }

};

module.exports. login = async (req, res, next) => {
    try {
        console.log(req.body);
        console.log(process.env.PORT);
        const { username, password } = req.body;
        const isValidUser = await User.findOne({ username });
        if (!isValidUser) {
            res.json({ msg: "Invalid Username!! Please check the Spelling", status: false });
        }
        const isValidPassword = await bcrypt.compare(password, isValidUser.password);
        if (!isValidPassword) {
            res.json({ msg: "Incorrect Password!! Please Re-check the password", status: false });
        }
        delete isValidUser.password;
        res.json({ status: true, user: isValidUser, profileSet: isValidUser.isProfilePicSet });
    }
    catch (excpetion) {
        next(excpetion)
    }
}

module.exports.profile = async (req, res, next) => {
    try {
        console.log("In controller", req.body, req.params)
        const id = req.params.id;
        const image = req.body.image;
        console.log();
        const data = await User.findByIdAndUpdate(id, {
            isProfilePicSet: true,
            ProfilePic: image
        });
        const after = await User.findById(id).select(["isProfilePicSet", "ProfilePic"]);
        console.log(after.isProfilePicSet + data.ProfilePic)
        res.json({ profileSetStatus: after.isProfilePicSet, image: after.ProfilePic });
    }
    catch (excpetion) {
        next(excpetion)
    }
}

module.exports.forgotPassword = async (req, res, next) => {
    try {
        const secret = process.env.JWT_SECRET
        const { email } = req.body;
        const validEmail = await User.findOne({ email });
        if (!validEmail) {
            res.json({ status: false, msg: "This Email is not registered" });
        }
        else {
            const newSecret = secret + validEmail.password; //new secret generation so that one link can be used only once
            //payload generation for token
            console.log(newSecret)
            const payload = {
                email: validEmail.email,
                id: validEmail.id
            }
            //token generation
            const token = jwt.sign(payload, newSecret, { expiresIn: '15m' }); //expiresIn specified the time of expiration of that link
            //Link generation from the Token
            const link = `https://smart-room-chat.herokuapp.com/resetPassword/${validEmail.id}/${token}`
            const transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                service: 'Gmail',
                auth: {
                    user: 'smartroom112000@gmail.com',
                    pass: 'cfygcdoahicpklll',
                    clientId: "493873994150-ftl8d4q4gbs8nag8egrspfeuf8jej2sr.apps.googleusercontent.com",
                    clientSecret: "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",
                    accessToken: "1//04veMtke2LiDBCgYIARAAGAQSNwF-L9Ir4V0Fl1xnXxAmcKdgMhmVU3KCVmjopk6wfutd-N9kURhLuhwiYAg7x7x26SAffn9GO3Q",
                    refreshToken: "ya29.a0ARrdaM-AXa9pWnGblYl2EhlhftH7qa3xsejmuCvQO98vEWlQQ4sCHP1jR7T0PB4o0EZL3iIWSwfIcszPpV1WaFiKMIqluZDHUXBA4LggdHYAj4Pv2JEIypckar2AI_bZiCmYIPy1p0ku1wnhNJr0fLxsWqyr"
                }
            });
            const mailOptions = {
                from: 'smartroom@123',
                to: `${validEmail.email}`,
                subject: 'Reset Your Password',
                text: ` Here is Your Password Reset Link: <a href="${link}>Click Here</a> <br>
                        This Link is valid for 15 minutes. Note: Do not share the Link
                `
            }
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log("Could not send Email" + error.msg+ error);
                    res.json({ status: false, msg: "Could Not send the email" });
                }
                else {
                    console.log("Email sent");
                    res.json({ status: true, msg: "Email Send Successfully" });
                }
            })
            console.log(link)
        }
    }
    catch (exception) {
        next(exception);
    }
}

module.exports.resetPassword = async (req, res, next) => {
    try {
        const { password } = req.body;
        const { id, token } = req.params;
        console.log(id);
        console.log(password + " Ram " + req.body)
        const validUser = await User.findById(id);
        if (!validUser) {
            res.json({ status: false, msg: "User Not Found" });
        }
        else {
            const secret = process.env.JWT_SECRET + validUser.password;
            console.log(validUser.id + " " + validUser.password)
            const payload = jwt.verify(token, secret);
            console.log(password);
            const encryptedPassword = await bcrypt.hash(password, 10);
            const user = await User.findByIdAndUpdate(id, {
                password: encryptedPassword
            });
            delete user.password;
            res.json({ status: true, msg: "Password Reset Successful" })
        }
    } catch (exception) {
        res.json({ status: false, msg: "Either the Link is used or Expired" })
        next(exception)
    }
}

module.exports.getRooms = async (req, res, next) => {
    try {
        const { id } = req.params;
        const rooms = await User.findById(id).select(["Rooms"]);
        const allRooms = rooms.Rooms;
        const allRoomsName = [];
        let roomUsers = [];
        let roomUsersId = [];
        let roomname;
        for (var i = 0; i < allRooms.length; i++) {
            const roomDb = await Room.findById(allRooms[i]);
            const temp = [];
            for(let j=0;j<roomDb.allowedUsers.length;j++){ 
                const user = await User.findOne({username: roomDb.allowedUsers[j]});
                const userId = user._id;
                temp.push(userId);
            }
            roomname = roomDb.roomname;
            allRoomsName.push(roomname);
            roomUsers.push(roomDb.allowedUsers);
            roomUsersId.push(temp);
        }
        return res.json({ data: allRoomsName, roomIds: allRooms, roomUsers: roomUsers, roomUsersId: roomUsersId });
    } catch (error) {
        next(error)
    }
}

module.exports.createRoom = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { roomName } = req.body;
        const username = await User.findById(id).select(["username"]);
        const userRooms = await User.findById(id).select(["Rooms"]);
        const allRooms = userRooms.Rooms;
        const getRoomId = await Room.find({ roomname: roomName }).select(['_id']);
        let b = true
        console.log(getRoomId)
        for (let i = 0; i < getRoomId.length; i++) {
            if (allRooms.includes(getRoomId[i]._id)) {
                b = false
            }
        }
        if (!b) {
            res.json({ status: false, msg: `${username.username} already have this Room name` });
        }
        else {
            console.log(allRooms + " Done ");
            const room = await Room.create({
                roomname: roomName,
                activityStatus: true,
                allowedUsers: [username.username]
            });
            allRooms.push(room._id);
            const user = await User.findByIdAndUpdate(id, {
                Rooms: allRooms
            });
            res.json({ status: true, msg: "Room has been created" })
        }
    } catch (exception) {
        next(exception)
    }
}

module.exports.deleteRoom = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { roomName, roomId } = req.body;
        const user = await User.findById(id).select(['username', 'Rooms']);
        const rooms = await Room.findById(roomId).select(['allowedUsers']);
        const allUser = rooms.allowedUsers;
        const allRooms = user.Rooms;
        allRooms.remove(roomId);
        allUser.remove(user.username);
        if (allUser.length === 0) {
            const deleteRoom = await Room.deleteOne({ _id: roomId });
        }
        else {
            const updateRoom = await Room.findByIdAndUpdate(roomId, { allowedUsers: allUser });
        }
        const updatedUser = await User.findByIdAndUpdate(id, { Rooms: allRooms });
        res.json({ status: true, msg: "Room Deleted" });
    } catch (error) {
        next(error)
    }
}

module.exports.joinRoom = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { roomId } = req.body;
        const data = await User.findById(id).select(["username", "Rooms"]);
        const allRooms = data.Rooms;
        try{
            const rooms = await Room.findById(roomId); console.log(allRooms);
            if(!rooms){
                res.json({status: false, msg: "Invalid Id"});
            }
            if (allRooms.includes(roomId)) {
                res.json({ status: false, msg: `${data.username} is already member of this room` });;
            }
            else if (rooms.length === 0) {
                res.json({ status: false, msg: "This Room does not exist \n Please re-check id" })
            }
            else {
                const allUser = rooms.allowedUsers;
                allUser.push(data.username);
                const updateRoom = await Room.findByIdAndUpdate(roomId, { allowedUsers: allUser });
                allRooms.push(updateRoom._id);
                const updatedUser = await User.findByIdAndUpdate(id, { Rooms: allRooms });
                res.json({ status: true, msg: "Room joined" })
            }
        }catch(error){
            res.json({status: false, msg: "unable to join this room"});
        }
       
    } catch (error) {
        next(error)
    }
}

module.exports.addMember = async(req,res,next)=>{
    try {
        const { id } = req.params;
        const { userName, roomName, roomId } = req.body;
        const validUser = await User.findOne({ username: userName});
        if(!validUser){
            res.json({status: false, msg: "This user does not exist" })
        }
        else{
            const allRooms = validUser.Rooms;
            const validRoom = await Room.findById(roomId);
            const allUsers = validRoom.allowedUsers;
            if(allRooms.includes(roomId)){
                res.json({status: false, msg: `${userName} is already a member`})
            }
            else if(allUsers.includes(userName)){
                req.json({status: false, msg: `${userName} is already a member`})
            }
            else{
                allRooms.push(roomId);
                allUsers.push(userName);
                const updateRoom = await Room.findByIdAndUpdate(roomId,{
                    allowedUsers: allUsers
                });
                const updatedUser = await User.findOneAndUpdate({username: userName},{
                    Rooms: allRooms
                });
                res.json({status: true, msg: "User added"});
            }
        }
    } catch (error) {
        next(error)
    }
}