import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const RestaurantSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  name: {
    type: String,
    required: true,
  },
});
