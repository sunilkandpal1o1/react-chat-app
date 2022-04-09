// const fetch = require('fetch');

const form = document.querySelector(".form");
const usernameEle = document.querySelector("#username");
const passwordEle = document.querySelector("#password");
const mailEle = document.querySelector("#email");
const mailDiv = document.querySelector(".mail");

const btnOne = document.querySelector("#btnOne");
const btnTwo = document.querySelector("#btnTwo");

// mailDiv.style.display = 'none';

btnOne.addEventListener("click", (event) => {
  if (event.target.value == "SignUp") {
    mailDiv.style.display = "block";
    event.target.value = "SignIn";
    btnTwo.value = "SignUp";
  } else {
    mailDiv.style.display = "none";
    event.target.value = "SignUp";
    btnTwo.value = "SignIn";
  }
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const username = usernameEle.value.trim();
  const password = passwordEle.value.trim();
  const email = mailEle.value.trim();

  if (btnTwo.value == "SignIn") {
    console.log("login", username, password);
    if (username.length && password.length) {
      login(username, password);
    } else {
      console.log("Enter username and password");
    }
  } else {
    console.log("reg");

    if (username.length && password.length && email.length) {
      register(username, email, password);
    } else {
      console.log("Enter username and password and email");
    }
  }
});

const login = (username, password) => {
  const data = {
    username,
    password,
  };

  fetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("data ", data);
      if (data.status == 0) {
        sessionStorage.setItem("token", data.data.token);
        sessionStorage.setItem("user", data.data.username);
        window.location.href = "/chat.html";
      }
    })
    .catch((err) => {
      console.log("error ", err);
    });
};

const register = (username, email, password) => {
  console.log("registration");
  const data = {
    username,
    email,
    password,
  };

  fetch("/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((data) => {
      if(data.status == 0 ) {
      console.log("data ", data);
      usernameEle.value = '';
      mailEle.value = '';
      passwordEle.value = '';
      alert('Registration Successful. Login into your account');
      btnOne.click();
      //  sessionStorage.setItem('user',data.data.username);
      //  window.location.href = '/index.html';
      } else {
        console.log('response ', data);
        alert(data.msg);
      }
    })
    .catch((err) => {
      console.log("error ", err);
    });
};
