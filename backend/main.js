import express from "express";
import socket from "socket.io";
import cors from 'cors';
import bodyParser from "body-parser";
const path = require("path");
require("./db.js");
import auth from "./middlewares/auth";
import jwt from "jsonwebtoken";

import user from "./routes/user";
import fs from "fs";

import Room from "./models/room";
import User from "./models/user";
import Conversation from "./models/conversation";

const jwtKey = "kdfjaskfj";

const app = express();

// const server = require('http').createServer(app)
const port = process.env.PORT || 5000;

let userList = [];
let rooms = ["tech", "music", "business"];
// let chat = [];

app.use( cors({ 
  allowOrigin: '*'
}) );

app.use( bodyParser.json());

app.use(express.urlencoded({ extended: true }));

app.use(user)

const server = app.listen(port, () => {
  console.log("server running");
  console.log(`http://localhost:${port}`);
});
const io = socket(server);
//auth middleware for socket
io.use(async (socket, next) => {
  console.log("socket middleware ", socket.handshake.auth.token);
  try {
    const token = socket.handshake.auth.token;
    // console.log(req.headers.authorization)
    if (token) {
      // console.log("token", token);

      const verify = await jwt.verify(token, jwtKey);
      // console.log("verify", verify);
      if (verify) {
        const user = await jwt.decode(token);
        socket.user = user;

        next();
      } else {
        next(new Error("Authentication Error"));
      }
    } else {
      next(new Error("Token not provided"));
    }
  } catch (err) {
    console.log("catch error");
    console.log("error", err);
    next(new Error("Authentication Error"));
  }
});

io.on("connection", (socket) => {
  console.log("Some client connected");

  socket.on("newUser", (data) => {
    const username = data;

    // userList[socket.id] = username;
  });
  console.log("joining room", socket.user.username);
  socket.join(`${socket.user.username}`);

  socket.on("joinRoom", async ({ username, room }) => {
    console.log("joinRoom", username, room);
    console.log("socket user", socket.user);
    const currentRoom = await Room.findById(room);

    console.log("currentRoom", currentRoom);

    if (!currentRoom.isGroup) {
      console.log("Chating in room ", currentRoom._id);
      console.log("joining room", currentRoom._id);

      socket.join(`${currentRoom._id}`);

      let olderChats = await Conversation.find({ room: currentRoom._id })
        .populate("from", { username: 1 }).sort({createdAt: -1})
        .limit(10);
      olderChats = olderChats.map((chat) => {
        return {
          from: chat.from.username,
          msg: chat.msg,
          createdAt: chat.createdAt,
        };
      });
      console.log("older chats", olderChats);
      socket.emit("olderChats", olderChats);
    } else {
      let indexOfNewUser = userList.findIndex((user) => {
        return user.id == socket.id && user.room == room;
      });

      if (indexOfNewUser == -1) {
        userList.push({ id: socket.id, username, room });

        socket.join(room);
        const usersInTheRoom = userList.filter((user) => user.room == room);

        console.log("users in room ", usersInTheRoom);

        const chatFilePath = `db/chats/${room}.json`;
        const isFileExists = fs.existsSync(chatFilePath);

        if (isFileExists) {
          let data = fs.readFileSync(chatFilePath, { encoding: "utf-8" });

          data = JSON.parse(data);

          // console.log("data", data);

          socket.emit("olderChats", data);
        }

        const welcomeMsg = `Welcome ${username}, ${usersInTheRoom.length} user(s) online.`;
        socket.emit("connected", { from: "server", msg: welcomeMsg });

        const serverMsg = `${username} Connected.`;
        socket.broadcast
          .to(room)
          .emit("connected", { from: "server", msg: serverMsg });
      }
    }
  });

  socket.on("get-rooms", async ({ username }) => {
    console.log("get rooms event", socket.id);
    if (username) {
      const currentUser = await User.findOne({ username: username });

      const rooms = await Room.find({
        members: { $in: currentUser.id },
      }).populate("members", { username: 1 });
      console.log("rooms", rooms);
      socket.emit("rooms", rooms);
    }
  });

  // app.get('/get-rooms', auth, async (req, res) => {
  //   const currentUser = req.user;

  //   const rooms = await Room.find({ members: { $in: currentUser.id }});

  //   // console.log('rooms', rooms);
  //   res.json({ status: 0, msg: ''})
  //   socket.emit('rooms', 'rooms');
  // })

  socket.on("chat", async (data) => {
    console.log("new message: ", data);
    try {
      const roomId = data.room.split("-")[1];
      const toUser = data.room.split("-")[0];

      const conversation = {
        from: socket.user.id,
        msg: data.msg,
        room: roomId,
      };

      if(data.type) {
        conversation['type'] = data.type;
      }

      const response = await Conversation.create(conversation);
      console.log("chat created ", response);

      // const chatFilePath = `db/chats/${data.room}.json`;
      // const isFileExists = fs.existsSync(chatFilePath);

      // let chat = [];

      // if (isFileExists) {
      //   chat = fs.readFileSync(chatFilePath, { encoding: "utf-8" });

      //   chat = JSON.parse(chat);
      // }
      // chat.push(data);

      // console.log("chat ", chat);

      // fs.writeFileSync(`db/chats/${data.room}.json`, JSON.stringify(chat));

      data["from"] = socket.user.username;
      console.log("roomId on new chat", roomId);
      console.log("emiting new message to room", toUser);
      socket.broadcast.to(`${toUser}`).emit("newMessage", data);
      socket.broadcast.to(`${roomId}`).emit("newChat", data);
    } catch (err) {
      console.log("error", err);
    }
  });

  socket.on("radio", (data) => {
    const roomId = data.room.split("-")[1];
    const toUser = data.room.split("-")[0];
    data["from"] = socket.user.username;
    socket.broadcast.to(`${toUser}`).emit("newMessage", data);
    socket.broadcast.to(`${roomId}`).emit("newChat", data);
    // socket.emit('voice', data);
  });

  socket.on("leaveRoom", (data) => {
    console.log("leaveRoom", socket.id);
    console.log("userList before", userList);
    // console.log('user.id',user.id, 'socket.id',socket.id, 'user.room', user.room, 'data.room',data.room);
    try {
      if (userList.length) {
        let indexOfLeavingUser = userList.findIndex((user) => {
          return user.id == socket.id && user.room == data.room;
        });
        if (indexOfLeavingUser > -1) {
          const userLeaving = userList[indexOfLeavingUser];

          userList.splice(indexOfLeavingUser, 1);

          console.log("user list after remove ", userList);

          const serverMsg = `${userLeaving.username} left.`;
          socket.broadcast
            .to(data.room)
            .emit("connected", { from: "server", msg: serverMsg });
        }
      }
    } catch (err) {
      console.log("error ", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("disconnect");

    try {
      if (userList.length) {
        let indexOfLeavingUser = userList.findIndex((user) => {
          return user.id == socket.id;
        });

        if (indexOfLeavingUser > -1) {
          const userLeaving = userList[indexOfLeavingUser];

          userList.splice(indexOfLeavingUser, 1);

          console.log("user list after remove ", userList);

          const serverMsg = `${userLeaving.username} left.`;
          socket.broadcast
            .to(userLeaving.room)
            .emit("connected", { from: "server", msg: serverMsg });
        }
      }
    } catch (err) {
      console.log("error ", err);
    }
  });
});
