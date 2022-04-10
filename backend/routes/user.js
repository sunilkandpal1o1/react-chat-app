import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import auth from "../middlewares/auth";

import User from "../models/user";
import Request from "../models/request";
import Room from "../models/room";

const jwtKey = "kdfjaskfj";

const router = Router();

router.post("/login", async (req, res) => {
  console.log("login", req.body);
  try {
    const { username, password } = req.body;

    if (!username && !password) {
      return res
        .status(200)
        .json({ status: 1, msg: "Provide username and password" });
    }

    // let users = fs.readFileSync("db/users.json");
    // users = JSON.parse(users);

    const user = await User.findOne({ username: username });

    if (!user) {
      return res
        .status(200)
        .json({ status: 1, msg: "Username or Password is incorrect" });
    }
    console.log(user, password);

    const doesPassMatch = await bcrypt.compare(password, user.password);
    if (doesPassMatch) {
      let data = {
        username: user.username,
        id: user._id,
      };
      const token = await jwt.sign(data, jwtKey);
      console.log("token", token);
      data = { ...data, token };
      console.log(data);
      res.status(200).json({ status: 0, msg: "Login successful", data });
    } else {
      return res
        .status(200)
        .json({ status: 1, msg: "Username or Password is incorrect" });
    }
  } catch (err) {
    console.log("error", err);
    res.status(500).json({ status: 1, msg: "Internal Server Error!" });
  }
});

router.post("/register", async (req, res) => {
  console.log("register", req.body);
  try {
    if (true) {
      // let users = fs.readFileSync("db/users.json");
      // users = JSON.parse(users);
      const { username, email, password } = req.body;

      const userExists = await User.findOne({ username });

      if (userExists) {
        res.json({ status: 1, msg: "Username is Taken" });
      }

      const encryptedPass = await bcrypt.hash(password, 10);

      let user = {
        username,
        email,
        password: encryptedPass,
      };

      const response = await User.create(user);

      console.log("res", response);

      // users.push(user);

      // fs.writeFileSync("db/users.json", JSON.stringify(users));

      res.status(200).json({ status: 0, msg: "Registration successful" });
    }
  } catch (err) {
    console.log("error", err);
  }
});

router.get("/get-friends", auth, async (req, res) => {
  console.log("get friends route");
  const username = req.user.username;
  const friends = await User.findOne({ username }, { friends: 1 }).populate('friends', { username: 1, email: 1});

  console.log("get friends route: friends", JSON.stringify(friends));

  res.json({ status: 0, msg: 'Operation Successful', data: friends.friends});
});

router.post("/get-users", auth, async (req, res) => {
  try {
    console.log("get-users route", req.user);
    let currentUser = req.user;
    currentUser = await User.findById(currentUser.id);
    // new RegExp()
    console.log('currentUser ', currentUser);
    const regx = new RegExp(`${currentUser.username}`);
    console.log('regx ', regx);

    let users = await User.find({ username: { $not: regx}}, { username: 1 }).lean();

    let sentRequests = await Request.find({ from: currentUser._id, status: 'notApproved' }).lean();
    sentRequests = sentRequests.map(sentReq => `${sentReq.to}` );
    console.log('sentRequets', sentRequests);
    console.log('friends' , currentUser.friends);
    users = users.filter(user => !sentRequests.includes(`${user._id}`));
    users = users.filter(user => !currentUser.friends.includes(user._id))

    console.log("get users route: users", currentUser.username, users);

    res.json({ status: 0, msg: "Operation Successful", data: users });
  } catch (err) {
    console.log('error', err);
  }
});

router.post("/connect", auth, async (req, res) => {
  console.log("req body", req.body, req.user);
  try {
    const request = new Request({
      from: req.user.id,
      to: req.body.userId,
    });

    console.log("request ", request);
    const response = await request.save();
    console.log("response ", response);

    res.json({ status: 0, msg: "Request Sent succefully" });
  } catch (err) {
    console.log("error", err);
    res.status(500).json({ status: 1, msg: "Internal Server Error" });
  }
});

router.get("/get-requests", auth, async (req, res) => {
  try {
    console.log('get requests route');
    const currentUser = req.user;
    console.log("currentUser ", currentUser);
    const requests = await Request.find(
      { to: currentUser.id, status: 'notApproved' },
      { status: 1, from: 1, createdAt: 1 }
    )
      .populate("from", { username: 1 })
      .lean();
    console.log("get requests route: requests",currentUser.username, requests);

    res.json({ status: 0, msg: "Operation Successfull", data: requests });
  } catch (err) {
    console.log("error", err);
    res.status(500).json({ status: 1, msg: "Internal Server Error" });
  }
});

router.get("/get-sent-requests", auth, async (req, res) => {
  try {
    console.log('get sent requests route');
    const currentUser = req.user;
    console.log("currentUser ", currentUser);
    const requests = await Request.find(
      { from: currentUser.id, status: 'notApproved' },
      { status: 1, from: 1, createdAt: 1 }
    )
      .populate("from", { username: 1 })
      .lean();
    console.log("get sent requests route: requests", currentUser.username, requests);

    res.json({ status: 0, msg: "Operation Successfull", data: requests });
  } catch (err) {
    console.log("error", err);
    res.status(500).json({ status: 1, msg: "Internal Server Error" });
  }
});

router.post('/accept-req', auth, async (req,res) => {
  try {
    const currentUser = req.user;
    const friend = req.body.user;
    console.log('/accept-req', currentUser, friend);
    const isAlreadyFriends = await User.findOne({ _id: currentUser.id, friends: {$in: [friend.id]} });
    console.log('isAlreadyFriends', isAlreadyFriends);
    if(!isAlreadyFriends) {
      const response1 = await User.findByIdAndUpdate(currentUser.id, { $push: { friends: friend.id}},{ new: true});
      console.log('response1 ',response1);
      const response2 = await User.findByIdAndUpdate(friend.id, { $push: { friends: currentUser.id}},{ new: true});
      console.log('response2 ',response2);

      const response3 = await Request.findOneAndUpdate({ from: friend.id, to: currentUser.id }, { $set: { status: 'approved'}},{ new: true})
      console.log('response3 ',response3);

      const response4 = await Request.findOneAndUpdate({ to: friend.id, from: currentUser.id }, { $set: { status: 'approved'}},{ new: true})
      console.log('response4 ',response4);

      res.json({ status: 0, msg: 'Operation Successful'})

    } else {
      res.json({ status: 1, msg: 'Already Friends'})
    }
    
  } catch (err) {
    console.log('error',err);
  }
});

router.post('/start-chat', auth, async (req, res) => {
  try {
    const currentUser = req.user;
    const userId = req.body.userId;

    const data = {
      members: [ currentUser.id, userId ]
    }

    const room = await Room.create(data);
    console.log('room',room);
    res.json({ status: 0, msg: "Chat Started"});
  } catch (err) {
    console.log('error', err);
  }
});

router.post("/get-active-chats", auth, async (req, res) => {
  const username = req.body.username;
  if (username) {
    const currentUser = await User.findOne({ username: username });

    let rooms = await Room.find({
      members: { $in: currentUser.id },
    }, { isGroup: 1 }).populate("members", { username: 1 });

    rooms = rooms.map( room => {
      const otherMember = room.members.find( member => member.username != username );

      return {
        id: room._id,
        isGroup: room.isGroup,
        otherMember
      }
    })
    console.log("rooms", rooms);
    res.status(200).json({ status: 0, data: rooms })
  } else {
    res.status(200).json({ status: 1, msg: "User not provided" })
  }
});

export default router;
