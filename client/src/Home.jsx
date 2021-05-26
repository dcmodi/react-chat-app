import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "./bootstrap.css";
import "./home.css";

const Home = () => {
  let [obj, setObj] = useState({
    username: "",
    room: "",
  });
  let inputValue = (e) => {
    setObj((prevVal) => {
      return {
        ...prevVal,
        [e.target.name]: e.target.value,
      };
    });
  };
  return (
    <>
      <div className="container ">
        <div className="form">
          <h1>Chat App</h1>

          <input
            type="text"
            placeholder="Enter UserName"
            value={obj.username}
            onChange={inputValue}
            name="username"
          />
          <select onChange={inputValue} name="room">
            <option value="">-------- Select Room --------</option>
            <option value="room3">Room1</option>
            <option value="room2">Room2</option>
          </select>

          <NavLink
            to={`/chat/${obj.username}/${obj.room}`}
            className="btn bg-white"
          >
            Join
          </NavLink>
        </div>
      </div>
    </>
  );
};

export default Home;
