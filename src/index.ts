import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import connectMongoDb from "../src/core/connection/mongo_connection";
import path from "path";
// Routes"
import Routes from "./api/_routes/index";
import { sendMenuViewedNotification } from "../src/api/notification/notification_controller";
dotenv.config();
const PORT = process.env.PORT || 3000;
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/api", Routes);
//sendMenuViewedNotification();
app.listen(PORT, async () => {
  await connectMongoDb();

  console.log("App listening on port ", PORT);
});
