import express from "express";
import AuthenticationRoutes from "./api/routes/authentication_routes";
import PlanRoutes from "./api/routes/plan_routes";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import connectMongoDb from "../src/core/connection/mongo_connection";

dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Add "/api/v1" prefix to all routes code

app.use("/api/v1/auth", AuthenticationRoutes);
app.use("/api/v1/plan", PlanRoutes);

app.listen(PORT, async () => {
  await connectMongoDb();

  console.log("Example app listening on port ", PORT);
});
