const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, unique: true, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    id_number: { type: String, required: true },
    college: { type: String, required: true },
    bio: { type: String, default: "" },
    pfp_url: { type: String, default: "/images/default-avatar.jpg" },
    created_at: { type: Date, default: Date.now }
});

// Hash the password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        return next(err);
    }
});

module.exports = mongoose.model("User", userSchema);
