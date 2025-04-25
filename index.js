// import express from "express";
// import { createServer } from "http";
// import { Server } from "socket.io";
// import { fileURLToPath } from 'url';
// import { dirname, join } from 'path';

// const app = express();
// const server = createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: "*", // Update to specific origin in production!
//     methods: ["GET", "POST"]
//   }
// });

// const allusers = {};

// const __dirname = dirname(fileURLToPath(import.meta.url));

// // Optional: Serve static files (useful for web demo)
// app.use(express.static("public"));

// app.get("/", (req, res) => {
//   res.sendFile(join(__dirname + "/public/index.html"));
// });

// io.on("connection", (socket) => {
//   console.log(`🔌 New connection: ${socket.id}`);

//   // Handle joining user
//   socket.on("join-user", (username) => {
//     console.log(`👤 ${username} joined`);
//     allusers[username] = { username, id: socket.id };
//     io.emit("joined", allusers);
//   });

//   // Handle offerr
//   socket.on("offer", ({ from, to, offer }) => {
//     console.log(`📞 Offer from ${from} to ${to}`);
//     io.to(allusers[to].id).emit("offer", { from, to, offer });
//   });

//   // Handle answer
//   socket.on("answer", ({ from, to, answer }) => {
//     if (allusers[from]) {
//       console.log(`✅ Answer from ${from} to ${to}`);
//       io.to(allusers[to].id).emit("answer", { from, to, answer });
//     } else {
//       console.log(`⚠️ User '${to}'  TO not found in allusers during answer`);
//       console.log(`⚠️ User '${from}'  FROM not found in allusers during answer`);
//       console.log(`⚠️ User '${answer}' ANSWER not found in allusers during answer`);
//     }
//     // console.log(`✅ Answer from ${from} to ${to}`);
//     // io.to(allusers[from].id).emit("answer", { from, to, answer });
//   });

//   // Handle ICE candidate
//   socket.on("icecandidate", ({ to, candidate }) => {
//     console.log(`🧊 ICE candidate sent to ${to}`);
//     if (allusers[to]) {
//       io.to(allusers[to].id).emit("icecandidate", { candidate });
//     }
//   });

//   // Handle call end
//   socket.on("end-call", ({ from, to }) => {
//     console.log(`🔚 Call ended between ${from} and ${to}`);
//     if (allusers[to]) {
//       io.to(allusers[to].id).emit("end-call", { from, to });
//     }
//   });

//   // Handle full call-ended (both sides)
//   socket.on("call-ended", (caller) => {
//     const [from, to] = caller;
//     if (allusers[from]) io.to(allusers[from].id).emit("call-ended", caller);
//     if (allusers[to]) io.to(allusers[to].id).emit("call-ended", caller);
//   });

//   // Handle disconnection
//   socket.on("disconnect", () => {
//     const userEntry = Object.entries(allusers).find(
//       ([, value]) => value.id === socket.id
//     );
//     if (userEntry) {
//       const [username] = userEntry;
//       console.log(`❌ ${username} disconnected`);
//       delete allusers[username];
//       io.emit("joined", allusers); // Update everyone
//     }
//   });
// });

// server.listen(9000, () => {
//   console.log(`🚀 Server listening on http://localhost:9000`);
// });









const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // ✅ allow any frontend to connect (use your frontend URL in production)
    methods: ['GET', 'POST']
  }
});

const users = {};

io.on('connection', (socket) => {
  console.log('⚡ New client connected:', socket.id);

  socket.on('join-user', (username) => {
    users[username] = socket.id;
    socket.username = username;
    console.log('👤 User joined:', username);
    io.emit('joined', users);
  });

  socket.on('offer', ({ from, to, offer }) => {
    const targetSocketId = users[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit('offer', { from, offer });
      console.log(`📤 Offer from ${from} to ${to}`);
    }
  });

  socket.on('answer', ({ from, to, answer }) => {
    const targetSocketId = users[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit('answer', { from, answer });
      console.log(`📥 Answer from ${from} to ${to}`);
    }
  });

  socket.on('icecandidate', ({ to, candidate }) => {
    const targetSocketId = users[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit('icecandidate', { candidate });
      console.log(`🧊 ICE candidate sent to ${to}`);
    }
  });

  socket.on('call-ended', ({ to }) => {
    const targetSocketId = users[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit('call-ended');
      console.log(`📴 Call ended sent to ${to}`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Disconnected: ${socket.username || socket.id}`);
    if (socket.username) {
      delete users[socket.username];
      io.emit('joined', users);
    }
  });
});

const PORT = 9000;
server.listen(PORT, () => {
  console.log(`🚀 Signaling server running on http://localhost:${PORT}`);
});

