import React, { useEffect, useState } from "react";
import "./chat.css";
import io from "socket.io-client";
import { useHistory, useParams } from "react-router-dom";
import ScrollToBottom from "react-scroll-to-bottom";

var socket;

const Chat = ({ location }) => {
  const params = useParams();
  let [text, setText] = useState("");
  let [messages, setMessages] = useState([]);
  let [users, setUsers] = useState([]);
  let history = useHistory();
  let send;
  const ENDPOINT = "https://react-chat-web1.herokuapp.com/";

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("join-room", {
      user: params.user.toString(),
      room: params.room.toString(),
    });
    socket.on("history", (data) => {
      //console.log(data.msgs);
      if (data) {
        setMessages(data.msgs);
        setUsers(data.users);
      } else {
        console.log("err");
      }
      //console.log(`Mesages:${messages},Users:${users}`);
    });
  }, [ENDPOINT, params]);

  useEffect(() => {
    socket.on("msg", (data) => {
      //console.log(msg);
      setMessages(data.msgs);
      //console.log(messages);
    });
  }, [send]);

  let sendMesg = async () => {
    let msgObj = {
      msg: text,
      user: params.user,
      room: params.room,
    };
    //console.log(msgObj)
    setText("");
    send = true;
    socket.emit("sendmsg", msgObj);
  };
  let leaveRoom = () => {
    socket.emit("leave", { room: params.room });
    socket.off();
    history.push("/");
  };
  
  return (
    <>
      <div className="container-fluid chat-container">
        <div className="chat">
          <div className="row">
            <div className="col-4 users">
              <h1 className="text-dark mt-2 ms-5 mb-2">Users</h1>
              <ul
                style={{
                  listStyleType: "circle",
                }}
              >
                {users.map((user, index) => {
                  return <li key={`user${index}`}>{user}</li>;
                })}
                <li>{params.user}</li>
              </ul>
              <div className="logout">
                <button
                  to="/"
                  style={{
                    color: "white",
                  }}
                  onClick={leaveRoom}
                >
                  Leave
                </button>
              </div>
            </div>
            <div
              className="col-8"
              style={{
                padding: "5%",
              }}
            >
              <ul>
                <ScrollToBottom className="msg_css">
                  {messages.map((msg, index) => {
                    //console.log(index);
                    return msg.user === params.user ? (
                      <Sender
                        msg={msg.msg}
                        user={msg.user}
                        key={`sender${index}`}
                      />
                    ) : (
                      <Receiver
                        msg={msg.msg}
                        user={msg.user}
                        key={`receiver${index}`}
                      />
                    );
                  })}
                </ScrollToBottom>
              </ul>
              <div className="input">
                <input
                  type="text"
                  placeholder="Enter Text"
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);
                  }}
                />
                <button className="btn bg-white send" onClick={sendMesg}>
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Chat;

const Sender = (props) => {
  return (
    <>
      <li className="mt-1">
        <div className="sender">
          <u>
            <p>{props.user}</p>
          </u>
          <p>{props.msg}</p>
        </div>
      </li>
    </>
  );
};
const Receiver = (props) => {
  return (
    <>
      <li className="mt-1 me-1">
        <div className="receiver">
          <u>
            <p>{props.user}</p>
          </u>
          <p>{props.msg}</p>
        </div>
      </li>
    </>
  );
};
