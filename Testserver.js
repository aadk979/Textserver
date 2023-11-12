const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
let username;
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

function generateUniqueCode() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';

  for (let i = 0; i < 15; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));

    // Add a dash every 5 characters except for the last one
    if ((i + 1) % 5 === 0 && i !== 14) {
      code += '-';
    }
  }

  return code;
}

let systemstorage = {};

// Function to save data to system storage
function savetosystemstorage(key, data1, data2) {
  systemstorage[key] = { name: data1, uic: data2 };
}

// Function to retrieve only the second data
function retrieveSecondData(key) {
  const storedData = systemstorage[key];

  if (storedData) {
    return storedData.uic;
  } else {
    return null; // or any default value you prefer
  }
}

io.on("connection", (socket) => {
  	socket.on("redirect-request" , (data)=>{
      const code = generateUniqueCode();
      io.emit(data,{link:"https://resonant-squirrel-ba2715.netlify.app" , uic: code});
    })
    socket.on("enckey",(data)=>{
        io.emit("enckey", ({user: data.user , key: data.key }));
    });
    socket.on("message" , (data)=>{
        io.emit("message" , ({message:data.message,time:data.time,to:data.to,from:data.from}))  });
    socket.on("newuser" , (data) =>{
        io.emit("newuser", data);
    });
    socket.on("id" ,  (data)=>{
        io.emit("id" , ({user: data.user ,uic: data.uic}));
        savetosystemstorage(socket.id , data.user ,data.uic);
    })
    socket.on("disconnect" , ()=>{
      const data = retrieveSecondData(socket.id);
      io.emit("disc" , ({uic: data}));
      
    })
});

const PORT = process.env.PORT || 5500;

server.listen(PORT, () => {
    console.log(`Server is up and running, server listening on port ${PORT}.`);
});
