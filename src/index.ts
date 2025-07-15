import express from "express";
import AuthController from "./Controllers/Auth.controller";
import sequelize from "./config/sequelize";
import { upload } from "./Services/Multer.services";
import userActionsController from "./Controllers/userActions.controller";
import AuthMiddleware from "./Middleware/verifyToken";
const cors = require("cors");
var bodyParser = require("body-parser");

const app = express();

const FRONTEND_URL: any = process.env.FRONTEND_URL;
const PORT = process.env.PORT || 8000;

interface corsInterface {
  origin: string;
  methods: string[];
  allowedHeaders?: string[];
}

const allowedCorsUrls = FRONTEND_URL
    ? FRONTEND_URL.split(',')
    : [];

    console.log(allowedCorsUrls)

const corsOption: corsInterface = {
  origin: allowedCorsUrls,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOption));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));

app.post("/signup", AuthController.signup);
app.post("/login", AuthController.login);
app.post("/post", upload.fields([
    { name: "person1", maxCount: 1 },
    { name: "person2", maxCount: 1 },
  ]), AuthMiddleware.verifyToken, userActionsController.createPost);
app.post("/vote", userActionsController.vote);
app.get("/fetchPost/:postId", userActionsController.fetchPost);
app.get("/userposts", AuthMiddleware.verifyToken, userActionsController.fetchUserPosts)
app.post("/feed", userActionsController.getUserFeed);


const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("DB connection established");

    await sequelize.sync({ alter: process.env.ALTER_DB === 'true' });
    console.log("Database synced");

    app.listen(PORT, () => {
      console.log(`Server is listening on port: ${PORT}`);
    });
  } catch (error) {
    console.error("Startup error:", error);
  }
};

startServer();