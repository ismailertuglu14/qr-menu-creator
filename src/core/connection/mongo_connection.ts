import mongoose from "mongoose";

const connectMongoDb = async () => {
  await mongoose.connect(process.env.MONGO_URI);
};

export default connectMongoDb;
