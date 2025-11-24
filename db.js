const mongoose = require("mongoose");
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const Schema = mongoose.Schema;
const ObjectId = mongoose.ObjectId;

const User = new Schema({
  name: { type: String, unique: true, required: true },
  email: String,
  password: String,
});

const Todo = new Schema({
  title: String,
  done: Boolean,
  userId: ObjectId,
});

const UserModel = mongoose.model("users", User);

const TodoModel = mongoose.model("todos", Todo);

module.exports = {
  UserModel: UserModel,
  TodoModel: TodoModel,
};
