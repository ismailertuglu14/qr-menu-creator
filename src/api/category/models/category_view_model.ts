import mongoose from "mongoose";

const CategoryView = new mongoose.Schema({
  restaurantId: {
    type: String,
    required: true,
  },
  menuId: {
    type: String,
    required: true,
  },
  categoryId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
});
