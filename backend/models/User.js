const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "merchant", "admin"], default: "user" },
  }, { timestamps: true });
  
  export default mongoose.model("User", UserSchema);
  