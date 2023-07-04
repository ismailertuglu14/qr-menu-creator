import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import connectMongoDb from "../src/core/connection/mongo_connection";
import path from "path";
// Routes

import AuthenticationRoutes from "./api/routes/authentication_routes";
import PlanRoutes from "./api/routes/plan_routes";
import RestaurantRoutes from "./api/routes/restaurant_routes";
import MenuRoutes from "./api/routes/menu_routes";
import CategoryRoutes from "./api/routes/category_routes";
import ProductRoutes from "./api/routes/product_routes";

dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());
console.log(path.join(__dirname, "..", "public"));
app.use(express.static(path.join(__dirname, "..", "public")));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Add "/api/v1" prefix to all routes code

app.use("/api/v1/auth", AuthenticationRoutes);
app.use("/api/v1/plan", PlanRoutes);
app.use("/api/v1/restaurant", RestaurantRoutes);
app.use("/api/v1/menu", MenuRoutes);
app.use("/api/v1/category", CategoryRoutes);
app.use("/api/v1/product", ProductRoutes);

app.listen(PORT, async () => {
  await connectMongoDb();

  console.log("Example app listening on port ", PORT);
});
