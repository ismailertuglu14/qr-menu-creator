import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  restaurantId: {
    type: String,
    required: true,
  },
  menuId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  image: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  position: {
    type: Number,
  },
});

const Category = mongoose.model("Category", categorySchema);
export default Category;
