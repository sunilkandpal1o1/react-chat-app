import {
  BrowserRouter as Router,
  Routes,
  Route,

} from "react-router-dom";

import "./App.css";
import Home from "./Home";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import ErrorPage from "./components/ErrorPage";

function App() {
  

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/*" element={<ErrorPage />} />
      </Routes>
    </Router>
  );
}

export default App;
