require("dotenv").config();
const { TodoModel, UserModel } = require("./db");
const express = require("express");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const app = express();
app.use(express.json());

app.post("/signup", async function (req, res) {
  const name = req.body.name;
  const password = req.body.password;
  const email = req.body.email;

  await UserModel.create({
    name: name,
    email: email,
    password: password,
  });

  res.json({
    message: "You successfully signed in!!",
  });
});
app.post("/signin", async function (req, res) {
  const email = req.body.email;
  const password = req.body.password;

  const user = await UserModel.findOne({
    email: email,
    password: password,
  });

  if (user) {
    const token = jwt.sign(
      {
        id: user._id.toString(),
      },
      JWT_SECRET
    );
    res.json({
      token: token,
    });
  } else {
    res.status(403).json({
      message: "Incorrect credentials",
    });
  }
});
app.post("/todo", auth, async function (req, res) {
  const userId = req.userId;
  const title = req.body.title;
  const done = req.body.done;
  await TodoModel.create({
    title,
    done,
  });
  res.json({
    message: "Todo created",
  });
});
app.get("/todos", auth, async function (req, res) {
  const userId = req.userId;
  const todos = await TodoModel.find({
    userId: userId,
  });

  res.json({
    todos,
  });
});

function auth(req, res, next) {
  const token = req.headers.token;
  const decodedData = jwt.verify(token, JWT_SECRET);

  if (decodedData) {
    req.userId = decodedData.id;
    next();
  } else {
    res.status(403).json({
      message: "Invalid Credentials",
    });
  }
}

app.listen(3000);
