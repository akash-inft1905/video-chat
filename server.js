const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const { ExpressPeerServer } = require("peer");
const { v4: uuidv4 } = require("uuid");

const port = process.env.PORT || 4000;
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use("/peerjs", peerServer);

app.get("/", (req, res) => {
  res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
  res.render("index", { roomId: req.params.room });
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    // Broadcast to everyone in the room except the current user
    socket.to(roomId).broadcast.emit("user-connected", userId);

    socket.on("disconnect", () => {
      // Notify other users in the room about disconnection
      socket.to(roomId).broadcast.emit("user-disconnected", userId);
    });
  });
});

server.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
