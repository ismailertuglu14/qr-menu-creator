import mongoose from "mongoose";

const connectMongoDb = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  console.log("mongoDb connected");
};

export default connectMongoDb;
