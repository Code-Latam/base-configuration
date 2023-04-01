const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const multer = require("multer");
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");
const chatbotRoute = require("./routes/chatbots");
const router = express.Router();
const path = require("path");

dotenv.config();
console.log(process.env.MONGO_URL);
mongoose.set("strictQuery", true);

// MONGO_URL = mongodb+srv://myuser-01:Peluche01@Cluster0.jt0hbqx.mongodb.net/sample-guides?retryWrites=true&w=majority

mongoose.connect(
  process.env.MONGO_URL,
  (error) => {
    if (error) console.log(error);
    console.log("Connected to MongoDB");
    console.log(mongoose.connection.readyState);
  }
);
app.use("/images", express.static(path.join(__dirname, "public/images")));

//middleware
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    cb(null, req.body.name);
  },
});

const upload = multer({ storage: storage });
app.post("/api/upload", upload.single("file"), (req, res) => {
  try {
    return res.status(200).json("File uploded successfully");
  } catch (error) {
    console.error(error);
  }
});

app.use("/api/chatbots", chatbotRoute);
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);

app.listen(8800, () => {
  console.log("Backend server is running on port 8800!");
});
