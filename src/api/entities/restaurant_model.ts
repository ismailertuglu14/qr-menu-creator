import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import Roles from "../../core/constants/role_enum";
import Currency from "../../core/constants/currency_enum";

const SocialMediaSchema = new mongoose.Schema({
  instagram: { type: String },
  facebook: { type: String },
  twitter: { type: String },
  threads: { type: String },
  whatsapp: { type: String },
  website: { type: String },
});

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
  isActive: {
    type: Boolean,
    default: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  defaultCurrency: {
    type: String,
    enum: Currency,
    default: Currency.TL,
  },
  location: {
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
  },
  socialMedias: {
    type: SocialMediaSchema,
    default: {
      instagram: null,
      facebook: null,
      twitter: null,
      threads: null,
      whatsapp: null,
      website: null,
    },
  },
});

export default mongoose.model("Restaurant", RestaurantSchema);
