const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
    //user_id: { type: mongoose.Schema.Types.ObjectId, unique: true, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    id_number: { type: String, required: true },
    college: { type: String, required: true },
    bio: { type: String, default: "" },
    pfp_url: { type: String, default: "/images/spongebob.jpg" },
    created_at: { type: Date, default: Date.now }
});


module.exports = mongoose.model("User", userSchema);
