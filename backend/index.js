var express = require("express");
var path = require("path");
const http = require("http");
const mysql = require("mysql");
const socketio = require("socket.io");
const cors = require("cors");
const { copyFileSync } = require("fs");
const { resolve } = require("path");
const { json } = require("express");

require('dotenv').config()

var connection = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.password,
  database: process.env.DATABASE,
  port: 3306,
});

connection.connect((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("connected...");
  }
});

var app = express();

var server = http.createServer(app);
var io = socketio(server, {
  cors: {
    origin: "*",
  },
});

let users = [];
let msgs = [];

io.on("connection", (socket) => {
  console.log("New Connection!!");

  socket.on("join-room", async (data) => {
    //console.log(data)
    msgs = [];
    users = [];
    try {
      await joinRoom(data.room);
      socket.join(data.room);
      await addUser(data.user, data.room);
      let d = await getData(data.room);
      //console.log(d[0].msgs)
      if (d[0].msgs.length !== 0) {
        msgs = await JSON.parse(d[0].msgs);
      }
      if (d[0].users !== "") {
        users = await JSON.parse(d[0].users);
      }
      //console.log(msgs)
      io.to(data.room).emit("history", { msgs: msgs, users: users });
    } catch (err) {
      console.log(err);
    }
  });

  socket.on("sendmsg", async (msg) => {
    //console.log(msg)
    msgs.push(msg);
    await insertRecord(msgs, msg.room);
    io.to(msg.room).emit("msg", { msgs: msgs });
  });
  socket.on("leave", (data) => {
    socket.leave();
    console.log("User Left!!");
  });
});

var corsOptions = {
  origin: "http://localhost:3000",
  optionsSuccessStatus: 200, // For legacy browser support
};
app.use(cors());

// view engine setup
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// Calling Routes
app.get("/home", (req, res) => {
  res.send({
    obj: "hii",
  });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  res.send("Error").status(404);
});

let port = process.env.PORT || "3300";

server.listen(port, (port, err) => {
  if (!err) {
    console.log("Port Listening on 3300...");
  }
});

var joinRoom = (name) => {
  new Promise((resolve, reject) => {
    connection.query(
      `select * from chat where room_name =?`,
      [name.toString()],
      (err, data) => {
        //console.log(data)
        if (data.length === 0 && !err) {
          connection.query(
            `INSERT INTO chat(room_name) values(?)`,
            [name],
            (err, success) => {
              if (!err) {
                resolve(null);
              } else {
                reject(null);
              }
            }
          );
        }
      }
    );
  });
  //console.log(data)
};

var insertRecord = (msgs, room) => {
  let data = new Promise(async (resolve, reject) => {
    msgs = await JSON.stringify(msgs);
    connection.query(
      `update chat set msgs=? where room_name=?`,
      [msgs, room],
      (err, success) => {
        if (!err) {
          resolve(success);
        } else {
          reject(err);
        }
      }
    );
  });
};

var getData = (room) => {
  let data = new Promise((resolve, reject) => {
    connection.query(
      `select * from chat where room_name=?`,
      [room],
      (err, rows) => {
        //console.log(rows);
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      }
    );
  });
  return data;
};

var addUser = (username, room) => {
  let data = new Promise(async (resolve, reject) => {
    connection.query(
      "select * from chat where room_name=?",
      [room],
      async (err, rows) => {
        let u = [];
        if (rows[0].users !== "") {
          u = await JSON.parse(rows[0].users);
        }
        if (u.length === 0 || !u.includes(username)) {
          u.push(username);
          u = await JSON.stringify(u);
          connection.query(
            `update chat set users=? where room_name=?`,
            [u, room],
            (err, success) => {
              if (err) {
                reject(err);
              } else {
                //                console.log(success);
                resolve(success);
              }
            }
          );
        }
      }
    );
  });
};
