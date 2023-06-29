import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import Roles from "../../core/constants/role_enum";

const RestaurantSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  role: {
    type: Number,
    enum: Roles,
    default: Roles.BUSINESS,
  },
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    default: null,
    required: false,
  },
  currentPlanId: {
    type: String,
    default: null,
    required: false,
  },
  category: {
    type: String,
    default: null,
    required: false,
  },
  profileImage: {
    type: String,
    default: null,
    required: false,
  },
  bannerImage: {
    type: String,
    default: null,
    required: false,
  },
});

export default mongoose.model("Restaurant", RestaurantSchema);
