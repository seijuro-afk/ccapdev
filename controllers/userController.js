const mongoose = require("mongoose");
const User = require("../models/userModel");

// Ensure registerUser is defined
exports.registerUser = async (req, res) => {
    try {
        console.log("Received user data:", req.body);

        let { username, email, password, confirm_password, id_number, college, bio } = req.body;

        // Convert array values to strings if necessary
        username = Array.isArray(username) ? username[0] : username;
        email = Array.isArray(email) ? email[0] : email;
        password = Array.isArray(password) ? password[0] : password;
        confirm_password = Array.isArray(confirm_password) ? confirm_password[0] : confirm_password;
        id_number = Array.isArray(id_number) ? id_number[0] : id_number;
        college = Array.isArray(college) ? college[0] : college;
        bio = Array.isArray(bio) ? bio[0] : bio;

        // Check if passwords match
        if (password !== confirm_password) {
            console.log("Passwords do not match.");
            return res.status(400).json({ error: "Passwords do not match." });
        }

        // Check if username or email already exists
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            console.log("Username or email already exists.");
            return res.status(400).json({ error: "Username or email already exists." });
        }

        // Generate a unique user_id
        const user_id = new mongoose.Types.ObjectId();

        // Create new user
        const newUser = new User({ user_id, username, email, password, id_number, college, bio });
        await newUser.save();

        console.log("✅ User successfully registered:", newUser);
        res.redirect("/login"); // Redirect to login after successful signup
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ error: error.message });
    }
};

// Ensure loginUser is also exported
exports.loginUser = async (req, res) => {
    try {
        console.log("Received login data:", req.body);

        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || password !== user.password) {
            console.log("Invalid email or password.");
            return res.status(400).json({ error: "Invalid email or password." });
        }

        // Store user data in session
        req.session.user = { username: user.username, email: user.email };
        console.log("Session set:", req.session.user);

        // Ensure session is saved before redirecting
        req.session.save(err => {
            if (err) {
                console.error("Error saving session:", err);
                return res.status(500).json({ error: "Session error" });
            }
            res.redirect("/"); // Redirect after ensuring session is saved
        });

    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
