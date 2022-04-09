import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Home.css";

import User from "./components/User";
import axios from "axios";
function Home() {
  const [logout, setLogout] = useState(false);
  const [friends, setFriends] = useState([]);
  const [selectedChat, setSelectedChat] = useState({});

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
    axios
      .get("http://localhost:5000/get-friends", {
        headers: {
          authorization: `Bearer${localStorage.getItem("token")}`,
        },
      })
      .then(({ data: res }) => {
        if (res.status === 0) {
          setFriends(res.data);
        }
      });
  }, []);
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
          {friends.map((friend) => (
            <User
              key={friend._id}
              id={friend._id}
              username={friend.username}
              selectChat={() => setSelectedChat(friend)}
            />
          ))}
        </div>
      </div>
      <div className="chatSection">
        <header className="header">
          { Object.keys(selectedChat).length != 0 && <div className="chat-header">
            <div className="profile"></div>
            <div className="user-info">
              <h3 className="username">{selectedChat.username}</h3>
              <span>last seen 2 hours ago</span>
            </div>
          </div>}
        </header>
        <div className="chat-window"></div>
        <div className="chat-form">
          <input
            type="text"
            className="chat-input"
            placeholder="Type a message"
          />

          <input type="submit" className="chat-send--btn" value="Send" />
          {/* <button id="record" class="btn" value="start">
            WT
          </button> */}
        </div>
      </div>
    </div>
  );
}

export default Home;
