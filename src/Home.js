import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import io from 'socket.io-client';

import "./Home.css";

import User from "./components/User";
import Message from "./components/message/Message";
import axios from "axios";

const socket = io.connect('http://localhost:5000', {
  auth: {
    token: localStorage.getItem('token')
  }
});


function Home() {
  const [logout, setLogout] = useState(false);
  const [activeChats, setActiveChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState({});
  const [conversations, setConversations] = useState([]);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
    }
  }, [navigate, logout]);

  useEffect(() => {
    console.log("loutout", logout);
    if (logout) {
      localStorage.removeItem("token");
      setLogout(false);
    }
  }, [logout]);

  useEffect(() => {
    const data = {
      username: localStorage.getItem("username")
    };

    axios
      .post("http://localhost:5000/get-active-chats", data, {
        headers: {
          authorization: `Bearer${localStorage.getItem("token")}`,
        },
      })
      .then(({ data: res }) => {
        if (res.status === 0) {
          setActiveChats(res.data);
        }
      });
  }, []);

  const joinChat = ( chat ) => {
    setSelectedChat(chat);
    console.log('join',selectedChat)
    socket.emit('join_room', {
      username: chat.otherMember.username,
      room: chat.id
    } );
  };

  useEffect( () => {
    console.log('socket changed')
    socket.on('older_chats', data => {
      console.log('older chats',data);
      setConversations(data);
    });

    socket.on('new_message', data => {
      console.log('new message from server', data);
      setConversations( prev => [ data, ...prev ])
    })
  }, [socket]);

  const sendMessage = (e) => {
    e.preventDefault();
    console.log('new message', message, selectedChat);
    socket.emit('new_chat', {
      message,
      room: selectedChat.id,
    });
    setMessage("");
    setConversations( prev => [ { 
      from: localStorage.getItem('username'),
      msg: message,
      createdAt: new Date(),
    }, ...prev ])
  }

  return (
    <div className="main-container">
      <div className="side-bar">
        <header className="header">
          <div className="profile"></div>
          <div
            className="logout-btn"
            tooltip="Logout"
            onClick={() => setLogout(true)}
          >
            <i
              className="fa-solid fa-arrow-right-from-bracket"
              tooltip="Logout"
            ></i>
          </div>
        </header>
        <div className="user-list">
          <div className="user-list--item">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input
              type="text"
              className="input-search"
              placeholder="Search"
            ></input>
          </div>
          {activeChats.map((chat) => (
            <User
              key={chat.id}
              id={chat.id}
              username={chat.otherMember.username}
              selectChat={() => joinChat(chat)}
            />
          ))}
        </div>
      </div>
      <div className="chatSection">
        <header className="header">
          { Object.keys(selectedChat).length != 0 && <div className="chat-header">
            <div className="profile"></div>
            <div className="user-info">
              <h3 className="username">{selectedChat.otherMember.username}</h3>
              <span>last seen 2 hours ago</span>
            </div>
          </div>}
        </header>
        <div className="chat-window">
          {
            conversations.map( (convo, idx) => (
              <Message key={idx} {...convo}  />
            ))
          }
         
        </div>
        <form className="chat-form" onSubmit={sendMessage}>
          <input
            type="text"
            className="chat-input"
            placeholder="Type a message"
            name="message"
            value={message}
            onChange={ (e) => setMessage(e.target.value)}
            autoComplete="off"
          />

          {/* <input type="submit" className="chat-send--btn" value="Send" /> */}
          
          <button type="submit" className="chat-send--btn" disabled={ message == "" ? true : false }>
            <i class="fa-solid fa-paper-plane"></i>

          </button>
          {/* <button id="record" class="btn" value="start">
            WT
          </button> */}
        </form>
      </div>
    </div>
  );
}

export default Home;
