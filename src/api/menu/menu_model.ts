import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

function getFormattedDate() {
  var today = new Date();
  var day = today.getDate();
  var month = today.toLocaleString("default", { month: "long" }); // Ay ismini alırken uzun format kullanırız
  var year = today.getFullYear();

  var formattedDate = day + " " + month + " " + year;
  return formattedDate;
}

const menuSchema = new mongoose.Schema({
  restaurantId: {
    type: String,
    required: true,
  },
  templateId: {
    type: Number,
    default: 0,
    required: true,
  },
  name: {
    type: String,
    default: getFormattedDate(),
    required: true,
  },
  slug: {
    type: String,
    default: getFormattedDate(),
    required: true,
  },

  coverImage: {
    type: String,
    default: null,
  },
  position: {
    type: Number,
    required: true,
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

const Menu = mongoose.model("Menu", menuSchema);
export default Menu;
