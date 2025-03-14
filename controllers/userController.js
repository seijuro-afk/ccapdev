const User = require("../models/userModel");

exports.registerUser = async (req, res) => {
    try {
        const { username, user_id, id, password, bio, pfp_url } = req.body;
        const newUser = new User({ username, user_id, id, password, bio, pfp_url });
        await newUser.save();
        res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findOne({ user_id: req.params.user_id });
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
