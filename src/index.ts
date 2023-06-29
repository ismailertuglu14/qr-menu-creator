import express from "express";
import AuthenticationRoutes from "./api/routes/authentication_routes";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import connectMongoDb from "../src/core/connection/mongo_connection";

dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/auth", AuthenticationRoutes);
app.listen(PORT, async () => {
  await connectMongoDb();

  console.log("Example app listening on port ", PORT);
});
