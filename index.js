const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const multer = require("multer");

const cors = require('cors');

// allow any origin
const corsOptions = {
  origin: '*',
  credentials: true,
  optionSuccessStatus: 200
}

const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const chatbotRoute = require("./routes/chatbots");
const chathistoryRoute = require("./routes/chathistory");
const chatRoute = require("./routes/chat");
const clientsRoute = require("./routes/clients");


const router = express.Router();
const path = require("path");

dotenv.config();
console.log(process.env.MONGO_URL);
mongoose.set("strictQuery", true);

const MONGO_URL = process.env.MONGO_URL
// MONGO_URL = "mongodb://stevenb:Peluche01@ac-yhcnfkb-shard-00-00.jt0hbqx.mongodb.net:27017,ac-yhcnfkb-shard-00-01.jt0hbqx.mongodb.net:27017,ac-yhcnfkb-shard-00-02.jt0hbqx.mongodb.net:27017/?ssl=true&replicaSet=atlas-vrrym6-shard-0&authSource=admin&retryWrites=true&w=majority"
mongoose.connect(
  MONGO_URL,
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
app.use(cors(corsOptions));

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
app.use("/api/chathistory", chathistoryRoute);
app.use("/api/chat", chatRoute);
app.use("/api/clients", clientsRoute);


// const port = process.env.PORT || 8800
const port = process.env.PORT

app.listen(port, () => {
  console.log("Backend server is running on port " + port);
});
