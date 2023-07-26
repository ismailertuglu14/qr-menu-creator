import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const RestaurantCredentialSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  email: {
    type: String,
    required: true,
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
});

export default mongoose.model(
  "RestaurantCredential",
  RestaurantCredentialSchema
);
