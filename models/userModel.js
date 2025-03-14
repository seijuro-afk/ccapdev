const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    user_id: { type: String, required: true, unique: true },
    id: { type: Number, required: true },
    password: { type: String, required: true },
    bio: { type: String },
    joined_at: { type: Date, default: Date.now },
    pfp_url: { type: String }
});

module.exports = mongoose.model("User", UserSchema);
