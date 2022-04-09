import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";

const SignUp = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [signUpUser, setSignUpUser] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const submitForm = (e) => {
    e.preventDefault();
    if (formData.password === formData.confirmPassword) {
      console.log(formData);
      setSignUpUser(true);
    }
  };

  useEffect(() => {
    console.log("useEffect ", signUpUser, formData);
    if (signUpUser) {
      axios
        .post("http://localhost:5000/register", formData)
        .then((res) => {
          console.log('res -', res);
          setSignUpUser(false);
          if (res.data.status === 0) {
            console.log('status 0')
            setFormData({
              username: "",
              email: "",
              password: "",
              confirmPassword: "",
            });
            navigate('/login');
            // localStorage.setItem('loginToken', res.data.token);
          }
        })
        .catch((err) => {
          console.log("error in login ", err);
        });
    }
  }, [signUpUser, formData, navigate]);
  return (
    <div className="container">
      <h1>React + Socket Chat app</h1>
      <div className="form-container">
        <form className="form" onSubmit={submitForm}>
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
            <label htmlFor="email"> Email: </label>
            <input
              id="email"
              name="email"
              type="text"
              value={formData.email}
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
            <label htmlFor="confirmPassword"> Confirm Password: </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <button type="submit" className="btn submit-btn">
              Sign Up
            </button>
          </div>
        </form>
        <div className="form-link">
          <span>Already Registered? </span>
          <Link to={"/login"} className="link">
            LogIn
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
