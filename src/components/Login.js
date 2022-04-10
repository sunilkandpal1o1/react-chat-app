import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

import axios from "axios";

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [loginUser, setLoginUser] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    if (formData.username && formData.password) {
      setLoginUser(true);
    }
  };

  useEffect(() => {
    console.log("useEffect ", loginUser, formData);
    if (loginUser) {
      axios
        .post("http://localhost:5000/login", formData)
        .then(({ data }) => {
          setLoginUser(false);
          if (data.status == 0) {
            setFormData({ username: "", password: "" });
            localStorage.setItem("token", data.data.token);
            localStorage.setItem("username", data.data.username);
            navigate("/");
          }
        })
        .catch((err) => {
          console.log("error in login ", err);
        });
    }
  }, [loginUser]);
  return (
    <div className="container">
      <h1>React + Socket Chat app</h1>
      <div className="form-container">
        <form className="form" onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label htmlFor="username"> Username: </label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password"> Password: </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <button type="submit" className="btn submit-btn">
              Log In
            </button>
          </div>
        </form>
        <div className="form-link">
          <span>Not Registered? </span>
          <Link to={"/signup"} className="link">
            {" "}
            SignUP
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
