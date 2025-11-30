require("dotenv").config();
const { TodoModel, UserModel } = require("./db");
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const z = require("zod");
const JWT_SECRET = process.env.JWT_SECRET;
const app = express();
app.use(express.json());

app.post("/signup", async function (req, res) {
  //Input validation using zod
  const rqstBody = z.object({
    name: z
      .string()
      .trim()
      .min(3, "Name must be atleat 3 characters long")
      .max(30, "Name too long"),
    email: z
      .string()
      .trim()
      .min(3)
      .max(50)
      .email("Invalid email format")
      .regex(
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Email must be valid and contain a proper domain"
      ),
    password: z
      .string()
      .min(8, "Password must contain atleast 8 characters")
      .max(64, "Password too long")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[@$!%*?&]/,
        "Password must contain at least one special character (@, $, !, %, *, ?, &)"
      ),
  });

  const passedWithSuccess = rqstBody.safeParse(req.body);

  if (!passedWithSuccess.success) {
    res.json({
      message: "Invalid Credentials",
    });
    return;
  }

  const name = req.body.name;
  const password = req.body.password;
  const email = req.body.email;

  let errorThrown = false;

  try {
    const hashedPassword = await bcrypt.hash(password, 5);

    await UserModel.create({
      name: name,
      email: email,
      password: hashedPassword,
    });
  } catch (e) {
    res.json({
      message: "User already exists",
    });
    errorThrown = true;
  }

  if (!errorThrown) {
    res.json({
      message: "You successfully signed up!!",
    });
  }
});
app.post("/signin", async function (req, res) {
  const email = req.body.email;
  const password = req.body.password;

  const response = await UserModel.findOne({
    email: email,
  });
  if (!response) {
    res.json({
      message: "Invalid Credentials",
    });
  }

  const matchedPassword = await bcrypt.compare(password, response.password);

  if (matchedPassword) {
    const token = jwt.sign(
      {
        id: response._id.toString(),
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
