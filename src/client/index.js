import $ from "jquery";
import "./style.css";
import io from "socket.io-client";
import "@fortawesome/fontawesome-free/js/fontawesome";
import "@fortawesome/fontawesome-free/js/solid";

const form = $("#message-form");
const input = $("#message-input");
const messages = document.getElementById("messages");

const loginForm = $(".log-in");
const signupForm = $(".sign-up");
const content = $(".content");

let loginShow = false;
let signupShow = false;

let username = "";

let token = localStorage.getItem("token");

const socket = io.connect("localhost:8080", {
  transports: ["websocket"],
});

if (token != null && token != "null") {
  fetch(
    "/user/?" +
      new URLSearchParams({
        secret_token: token,
      })
  ).then(async (res) => {
    let json = await res.json();
    console.log(json);
    username = json.user.username;
    handleLoginDOM();
  });
}

const toggleLogIn = () => {
  loginShow = !loginShow;
  if (loginShow) {
    loginForm.addClass("show");
    content.addClass("blurOpac");
  } else {
    loginForm.removeClass("show");
    content.removeClass("blurOpac");
  }
};

const toggleSignUp = () => {
  signupShow = !signupShow;
  if (signupShow) {
    signupForm.addClass("show");
    content.addClass("blurOpac");
  } else {
    signupForm.removeClass("show");
    content.removeClass("blurOpac");
  }
};

$(".log-in-x").on("click", () => {
  toggleLogIn();
});

$(".log-in-btn").on("click", () => {
  toggleLogIn();
});

$(".sign-up-x").on("click", () => {
  toggleSignUp();
});

$(".sign-up-btn").on("click", () => {
  toggleSignUp();
});

form.on("submit", (e) => {
  e.preventDefault();
  if (input.val()) {
    socket.emit("chat message", input.val());
    input.val("");
  }
});

const loadMsg = ({ user, date, message }) => {
  console.log(date);
  const item = document.createElement("li");
  const _user = document.createElement("div");
  const _date = document.createElement("div");
  _date.classList.add("date");
  const _message = document.createElement("div");

  _user.textContent = user;
  _date.textContent = date;
  _message.textContent = message;
  item.append(_user, _date, _message);
  messages.appendChild(item);
  messages.scrollTo(0, messages.scrollHeight);
};

const clearBoard = () => {
  messages.innerHTML = "";
};

$(".log-in").on("submit", async (e) => {
  e.preventDefault();

  const data = new URLSearchParams();
  for (const pair of new FormData(e.currentTarget)) {
    data.append(pair[0], pair[1]);
  }

  fetch("/login", {
    method: "post",
    body: data,
  })
    .then(async (response) => {
      let json = await response.json();
      token = json.token;
      localStorage.setItem("token", token);
      window.location.reload();
      // username = json.username;

      // socket.emit("auth", { token: token });

      // toggleLogIn();
      // handleLoginDOM();
    })
    .catch(() => {
      $(".invalid").addClass("show");
    });
});

$(".sign-up").on("submit", async (e) => {
  e.preventDefault();

  const data = new URLSearchParams();
  for (const pair of new FormData(e.currentTarget)) {
    data.append(pair[0], pair[1]);
  }

  fetch("/signup", {
    method: "post",
    body: data,
  }).then(async (res) => {
    let json = await res.json();
    $(".bad-signup").text(json.message);

    if (json.token) {
      localStorage.setItem("token", json.token);
      window.location.reload();
    }
  });
});

$(".log-out-btn").on("click", () => {
  localStorage.removeItem("token");
  window.location.reload();
});

$(".log-in").on("keypress", () => {
  $(".invalid").removeClass("show");
});

$(".sign-up").on("keypress", () => {
  $(".bad-signup").text("");
});

$(".sign-up").on("keypress", () => {
  $(".bad-signup").text("");
});

$(".fbi-wrapper > input").on("change", () => {
  $(".bad-signup").text("");
});

const handleLoginDOM = () => {
  $(".welcome").text(`Welcome ${username}`);
  $(".welcome").addClass("logged-in");
  $(".log-in-btn").addClass("logged-in");
  $(".log-out-btn").addClass("logged-in");
  $(".sign-up-btn").addClass("logged-in");
};

socket.on("chat message", loadMsg);

socket.on("clear", clearBoard);

socket.on("first", () => {
  console.log(token);
  socket.emit("auth", { token: token });
});
