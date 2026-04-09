import mongoose from "mongoose";

const connectDB = async () => {
  try {
    return await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  } catch (error) {
    console.error("Connection failed:", error);
    process.exit(1); 
  }
};

export default connectDB;
