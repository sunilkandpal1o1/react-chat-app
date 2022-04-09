const form = document.querySelector(".chat-form");
const input = document.querySelector(".chat-input");
const chatWindow = document.querySelector(".chat-window");
const chatSubmit = document.querySelector(".chat-submit");
const userList = document.querySelector("#userList");
const chatHeader = document.querySelector(".chat-header");
const profile = document.querySelector("#profile");
const users = document.querySelector("#all-users-div");
const contacts = document.querySelector("#all-contacts-div");
const sentRequests = document.querySelector("#sent-requests-div");
const sea = document.querySelector(".sea");
const close = document.querySelector(".close");
const homeBtn = document.querySelector(".home-btn");
const requestsDiv = document.querySelector(".requests");
const requestsBtn = document.querySelector(".requests-btn");
const recordBtn = document.querySelector("#record");

let openChats = [];
const token = sessionStorage.getItem("token");
if (!token) {
  alert("Session Expired. Login");
  window.location.href = "/index.html";
}

const socket = io({
  auth: {
    token,
  },
});

headers = {
  pragma: "no-cache",
  "cache-control": "no-cache",
  Authorization: `Bearer${token}`,
};

chatSubmit.setAttribute("disabled", true);

homeBtn.addEventListener("click", (event) => {
  // sea.style.display = "block";
  // sea.style.opacity = 1;
  sea.classList.add("animate-down");
  getContacts();
  getSentRequests();
  getUsers();
});
close.addEventListener("click", () => {
  console.log("closing");
  // sea.style.display = "none";
  sea.style.opacity = 0;
  setTimeout(() => {
    console.log("removing class");
    sea.classList.remove("animate-down");
    sea.style.opacity = 1;
  }, 500);
  // sea.classList.add('animate-up')
});

requestsBtn.addEventListener("click", (event) => {
  console.log("requests display", requestsDiv.style.display);
  if (!requestsDiv.style.display || requestsDiv.style.display == "none") {
    requestsDiv.style.display = "block";
    getRequests();
  } else requestsDiv.style.display = "none";
});

let currentRoom = "";

input.addEventListener("input", (event) => {
  console.log("change");
  if (input.value.trim() == "")
    return chatSubmit.setAttribute("disabled", true);
  chatSubmit.removeAttribute("disabled");
});

const username = sessionStorage.getItem("user");
socket.emit("newUser", username);

socket.on("connected", (data) => {
  console.log(data);
  addNewMsg(data, false);
});

socket.emit("get-rooms", { username });

const getContacts = () => {
  const token = sessionStorage.getItem("token");
  fetch("/get-friends", {
    method: "GET",
    headers,
  })
    .then((res) => res.json())
    .then((res) => {
      console.log("get friends: res friends", res);
      if (res.status == 0) {
        // console.log("res ", res.data);
        contacts.innerHTML = "";

        const data = res.data;

        if (data.length) {
          data.forEach((user) => {
            console.log("user", user);
            const userEle = document.createElement("div");
            userEle.classList.add("user-sec");
            userEle.innerHTML = `
            <div class="user-dp"></div>
            <div class="user-name">${user.username}</div>
            <button class="btn init_chat-${user._id}">Start Chat</button>
          `;
            if (openChats.includes(user.username)) {
              userEle.innerHTML = `
              <div class="user-dp"></div>
              <div class="user-name">${user.username}</div>
              <button class="btn ">Chat</button>
            `;
            }

            contacts.appendChild(userEle);

            if (!openChats.includes(user.username)) {
              document
                .querySelector(`.init_chat-${user._id}`)
                .addEventListener("click", (event) => {
                  console.log("btn ", event.target.classList);
                  let userId = event.target.classList[1].split("-")[1];
                  // userId = { userId }
                  // console.log('userId',userId)
                  fetch("/start-chat", {
                    method: "POST",
                    headers: {
                      Authorization: `Bearer${token}`,
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ userId }),
                  })
                    .then((res) => res.json())
                    .then((res) => {
                      console.log("res", res);
                      if (res.status == 0) {
                        close.click();
                        socket.emit("get-rooms", { username: user.username });
                      }
                    })
                    .catch((err) => {
                      console.log("error", err);
                    });
                });
            }
          });
        } else {
          const textEle = document.createElement("div");
          textEle.innerHTML = `<h3>Make new friends by sending them connect request</h3>`;

          contacts.appendChild(textEle);
        }
      }
    });
};

// getContacts();

const getUsers = () => {
  const token = sessionStorage.getItem("token");

  fetch("/get-users", {
    method: "POST",
    headers: {
      Authorization: `Bearer${token}`,
    },
  })
    .then((res) => res.json())
    .then((res) => {
      if (res.status == 0) {
        console.log("res ", res.data);
        users.innerHTML = "";

        const data = res.data;

        data.forEach((user) => {
          console.log("user", user);
          const userEle = document.createElement("div");
          userEle.classList.add("user-sec");
          userEle.innerHTML = `
          <div class="user-dp"></div>
          <div class="user-name">${user.username}</div>
          <button class="btn btn-${user._id}">Connect</button>
        `;

          users.appendChild(userEle);
          document
            .querySelector(`.btn-${user._id}`)
            .addEventListener("click", (event) => {
              event.target.setAttribute("disabled", true);

              console.log("btn ", event.target.classList);
              let userId = event.target.classList[1].split("-")[1];
              // userId = { userId }
              // console.log('userId',userId)
              fetch("/connect", {
                method: "POST",
                headers: {
                  Authorization: `Bearer${token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ userId }),
              })
                .then((res) => res.json())
                .then((res) => {
                  console.log("res", res);
                  if (res.status == 0) {
                    // console.log('status 0', event);

                    event.target.innerText = "Request Sent";
                  }
                })
                .catch((err) => {
                  console.log("error", err);
                  event.target.removeAttribute("disabled");
                });
            });
        });
      }
    });
};

// getUsers();

const getRequests = () => {
  const token = sessionStorage.getItem("token");
  fetch("/get-requests", {
    method: "GET",
    headers,
  })
    .then((res) => res.json())
    .then((res) => {
      console.log("get request: res requests", res);
      if (res.status == 0) {
        requestsDiv.innerHTML = "";

        if (res.data.length) {
          res.data.forEach((request) => {
            console.log("request ", request);
            const user = request.from;
            const reqDiv = document.createElement("div");
            reqDiv.innerHTML = `
              <div class="request-sec">
              <span>${user.username}</span>
              <button class="btn req-${user._id}">Accept</button>
              </div>
              `;

            requestsDiv.append(reqDiv);

            document
              .querySelector(`.req-${user._id}`)
              .addEventListener("click", (event) => {
                const data = {
                  id: user._id,
                  username: user.username,
                };

                fetch("/accept-req", {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer${token}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ user: data }),
                })
                  .then((res) => res.json())
                  .then((res) => {
                    console.log("res", res);
                    if (res.status == 0) {
                      event.target.innerText = "Accepted";
                      event.target.setAttribute("disabled", true);
                    }
                  });
              });
          });
        } else {
          console.log("no requests");
          requestsDiv.innerHTML = `
          <div style="text-align: center;">No new Requests</div>`;
        }
      } else {
        alert(res.msg);
      }
    })
    .catch((err) => {
      console.log("error", err);
    });
};

const getSentRequests = () => {
  // const token = sessionStorage.getItem("token");
  fetch("/get-sent-requests", {
    method: "GET",
    headers,
  })
    .then((res) => res.json())
    .then((res) => {
      console.log("get sent request: res sent req", res);
      if (res.status == 0) {
        sentRequests.innerHTML = "";

        if (res.data.length) {
          res.data.forEach((request) => {
            console.log("request ", request);
            const user = request.from;
            const reqDiv = document.createElement("div");
            reqDiv.classList.add("user-sec");

            reqDiv.innerHTML = `
            <div class="user-dp"></div>
            <div class="user-name">${user.username}</div>
            <button class="btn init_chat-${user._id}">Request Sent</button>
          `;

            sentRequests.append(reqDiv);

            // document
            //   .querySelector(`.req-${user._id}`)
            //   .addEventListener("click", (event) => {
            //     const data = {
            //       id: user._id,
            //       username: user.username,
            //     };

            //     fetch("/accept-req", {
            //       method: "POST",
            //       headers: {
            //         Authorization: `Bearer${token}`,
            //         "Content-Type": "application/json",
            //       },
            //       body: JSON.stringify({ user: data }),
            //     })
            //       .then((res) => res.json())
            //       .then((res) => {
            //         console.log("res", res);
            //       });
            //   });
          });
        } else {
          const textEle = document.createElement("div");
          textEle.innerHTML = `<h3>You haven't sent any requests</h3>`;

          sentRequests.appendChild(textEle);
        }
      } else {
        alert(res.msg);
      }
    })
    .catch((err) => {
      console.log("error", err);
    });
};

profile.innerText = username;

socket.on("rooms", (data) => {
  console.log("rooms", data);
  userList.innerHTML = "";
  openChats = [];
  data.forEach((room) => {
    // console.log('room',room);
    const user = document.createElement("div");
    user.classList.add("list-item");
    user.classList.add(`user-${room._id}`);
    if (room.name) {
      user.setAttribute("id", `${room.name}-${room._id}`);
      user.innerText = room.name;
      openChats.push(room.name);
    } else {
      const otherMember = room.members.find(
        (member) => member.username != username
      );

      // console.log('other member', otherMember);
      user.setAttribute("id", `${otherMember.username}-${room._id}`);

      user.innerText = otherMember.username;
      openChats.push(otherMember.username);
    }

    userList.appendChild(user);
    document
      .querySelector(`.user-${room._id}`)
      .addEventListener("click", (event) => {
        let activeChat = document.querySelector(".active-chat");
        if (activeChat) activeChat.classList.remove("active-chat");

        // roomName = roomName.split("-")[1];
        const roomId = event.target.id.split("-")[1];
        // let roomName = `${event.target.innerText}-${roomId}`;
        const roomName = event.target.id;

        console.log("event", roomName, roomId);

        socket.emit("joinRoom", { username, room: roomId });

        if (currentRoom != roomName) {
          socket.emit("leaveRoom", { username, room: currentRoom });
          chatWindow.innerHTML = "";
        }

        currentRoom = roomName;

        chatHeader.innerText = currentRoom.split("-")[0];
        event.target.innerHTML = currentRoom.split("-")[0];

        event.target.classList.remove("new-chat");
        event.target.classList.add("active-chat");

        // socket.on('olderChats', data => {
        //   console.log('chats ', data);
        // })
      });
  });
});

socket.on("olderChats", (data) => {
  console.log("chats ", data);

  data.forEach((chat) => {
    console.log(chat);

    if (chat.from == username) {
      addNewMsg(chat, true, false);
    } else {
      addNewMsg(chat, false, false);
    }
  });
});

// socket.on('user-left', data => {

// })

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const msg = input.value.trim();

  if (msg != "") {
    console.log(msg);

    const data = { from: username, msg, room: currentRoom };
    addNewMsg(data, true);
    socket.emit("chat", data);

    input.value = "";
  }
});

socket.on("newChat", (data) => {
  console.log("newChat", data);
  if (currentRoom.split("-")[1] == data.room.split("-")[1]) {
    addNewMsg(data, false, true);
  }
});

socket.on("newMessage", (data) => {
  console.log(" new message ", data);
  if (currentRoom.split("-")[1] != data.room.split("-")[1]) {
    const user = document.querySelector(`.user-${data.room.split("-")[1]}`);
    user.classList.add("new-chat");
    user.innerHTML = `
    <span style='pointer-events: none;'>${data.from}</span><span class='chat-notifier'>1</span>`;
  }
});
const addNewMsg = (data, self, newChat) => {
  const msgBlock = document.createElement("div");
  const msg = document.createElement("div");
  msg.classList.add("msg");
  msgBlock.classList.add("render-message");
  if (data.from == "server") {
    msgBlock.classList.add("server-message");
  } else if (self) {
    msgBlock.classList.add("self-message");
    msg.classList.add("msg-self");
  } else {
    msgBlock.classList.add("others-message");
    msg.classList.add("msg-others");
  }
  if (data.type && data.type == "audio") {
    const arrayBuffer = data.voiceMsg;
    var blob = new Blob([arrayBuffer], { type: "audio/ogg; codecs=opus" });
    var audio = document.createElement("audio");
    audio.src = window.URL.createObjectURL(blob);
    audio.play();
    msgBlock.innerHTML = `
    <div><audio src=${window.URL.createObjectURL(
      blob
    )} controls></audio>
    </div>`;
  } else {
    msg.innerText = `${data.from} : ${data.msg}`;
    msgBlock.appendChild(msg);
    // msgBlock.prepend(msg);
  }
  if(newChat)
  chatWindow.prepend(msgBlock);
  else chatWindow.appendChild(msgBlock)

  chatWindow.scrollTop = chatWindow.scrollHeight - chatWindow.clientHeight;
};

var constraints = { audio: true };
let voiceMsg;
navigator.mediaDevices.getUserMedia(constraints).then(function (mediaStream) {
  var mediaRecorder = new MediaRecorder(mediaStream);
  mediaRecorder.onstart = function (e) {
    console.log("starting");
    this.chunks = [];
  };
  mediaRecorder.ondataavailable = function (e) {
    console.log("data available ", e.data);
    this.chunks.push(e.data);
  };
  mediaRecorder.onstop = function (e) {
    console.log("stopping");
    var blob = new Blob(this.chunks, { type: "audio/ogg; codecs=opus" });
    voiceMsg = blob;
    // socket.emit("radio", blob);
  };
  recordBtn.addEventListener("click", (event) => {
    // Start recording
    if (event.target.value == "start") {
      // console.log('starting')
      mediaRecorder.start();
      event.target.value = "stop";
      event.target.innerText = "Stop";
    }

    // Stop recording after 5 seconds and broadcast it to server
    // setTimeout(function () {
    //   mediaRecorder.stop();
    // }, 5000);
    else if (event.target.value == "stop") {
      // console.log('stopping')
      mediaRecorder.stop();
      event.target.value = "send";
      event.target.innerText = "Send";
    } else if (event.target.value == "send") {
      socket.emit("chat", { msg: voiceMsg, room: currentRoom, type: "audio" });
      event.target.value = "start";
      event.target.innerText = "WT";
    }
  });
});

// When the client receives a voice message it will play the sound
socket.on("voice", function (data) {
  console.log("voice msg", currentRoom.split("-")[1], data);
  if (currentRoom.split("-")[1] == data.room.split("-")[1]) {
    const arrayBuffer = data.voiceMsg;
    var blob = new Blob([arrayBuffer], { type: "audio/ogg; codecs=opus" });
    var audio = document.createElement("audio");
    audio.src = window.URL.createObjectURL(blob);
    audio.play();
  }
});
