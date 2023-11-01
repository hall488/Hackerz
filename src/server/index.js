require("dotenv").config();
const passport = require("passport");
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const path = require("path");
const message_controller = require("./controllers/messageController");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const { DateTime } = require("luxon");

mongoose.set("strictQuery", false);
const mongoDB = `mongodb+srv://hall488:${process.env.SECRET_KEY}j@cluster0.dh0zviq.mongodb.net/hackerz?retryWrites=true&w=majority`;

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}

require("./auth/auth");

const routes = require("./routes/routes");
const secureRoute = require("./routes/secure-routes");

const app = express();
const server = createServer(app);
const io = new Server(server);

const auth_sockets = [];
const auth_usernames = [];

app.use(passport.initialize());

app.use(bodyParser.urlencoded({ extended: false }));

app.use("/user", passport.authenticate("jwt", { session: false }), secureRoute);

app.use("/", routes);

app.use(express.static(path.resolve("dist")));

String.prototype.blackout = function () {
  var a = this.split("");
  a = a.map((s) => {
    if (s == " ") {
      return s;
    }
    return "\u25ae";
  });
  return a.join("");
};

const generateMessage = (message, user) => {
  let msg = {
    message: message,
    user: user,
    date: new Date(),
  };
  return msg;
};

const msgBlackout = ({ user, message, date }) => {
  return {
    user: user.blackout(),
    message: message.blackout(),
    date: date,
  };
};

const msgFormatDate = ({ user, message, date }) => {
  return {
    user: user,
    message: message,
    date: DateTime.fromJSDate(msg.date).toLocaleString(DateTime.DATETIME_FULL),
  };
};

io.on("connection", async (socket) => {
  let old_messages = await message_controller.messages();
  io.to(socket.id).emit("first");
  io.to(socket.id).emit("clear");

  socket.on("chat message", async (string) => {
    if (!auth_sockets.includes(socket.id)) {
      return;
    }
    let msg = generateMessage(
      string,
      auth_usernames[auth_sockets.indexOf(socket.id)]
    );

    await message_controller.sendMessage(msg);

    io.sockets.adapter.sids.forEach((value, id) => {
      if (auth_sockets.includes(id))
        io.to(id).emit("chat message", msgFormatDate(msg));
      else io.to(id).emit("chat message", msgFormatDate(msgBlackout(msg)));
    });
  });

  socket.on("auth", ({ token }) => {
    jwt.verify(token, "TOP_SECRET", function (err, decoded) {
      if (err) return;

      if (!auth_sockets.includes(socket.id)) {
        auth_sockets.push(socket.id);
        auth_usernames.push(decoded.user.username);
      }
    });

    old_messages.forEach((msg) => {
      if (auth_sockets.includes(socket.id)) {
        io.to(socket.id).emit("chat message", msgFormatDate(msg));
      } else {
        io.to(socket.id).emit("chat message", msgFormatDate(msgBlackout(msg)));
      }
    });
  });

  socket.on("disconnect", () => {
    if (auth_sockets.includes(socket.id)) {
      auth_sockets.splice(auth_sockets.indexOf(socket.id), 1);
      auth_usernames.splice(auth_sockets.indexOf(socket.id), 1);
    }
  });
});

server.listen(8080, () => console.log(`Listening on port 8080`));
