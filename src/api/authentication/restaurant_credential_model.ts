import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import Provider from "./models/provider_model";
import Roles from "../../core/constants/role_enum";
const RestaurantCredentialSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  email: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: Roles,
    default: Roles.BUSINESS,
  },
  provider: {
    type: Number,
    enum: Provider,
    default: Provider.INTERNAL,
  },
  hashedPassword: {
    type: String,
    required: true,
  },
  phone: {
    countryCode: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  resetPasswordCode: {
    type: String,
    default: null,
  },
  resetPasswordCodeExpiry: {
    type: Date,
    default: null,
  },
  resetPassswordToken: {
    type: String,
    default: null,
  },
  resetPasswordTokenExpiry: {
    type: Date,
    default: null,
  },
});

export default mongoose.model(
  "RestaurantCredential",
  RestaurantCredentialSchema
);
