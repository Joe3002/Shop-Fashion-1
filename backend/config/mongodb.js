// ...existing code...
import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Kết nối MongoDB thành công");
    } catch (err) {
        console.error("MongoDB connection error:", err.message);
        process.exit(1);
    }
}
export default connectDB;
// ...existing code...