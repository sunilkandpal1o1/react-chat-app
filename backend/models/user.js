import mongoose from "mongoose";

const user = mongoose.Schema({
  username: {
    type: String,
    require: true,
    unique: true,
  },
  email: String,
  password: String,
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

export default mongoose.model("User", user);
