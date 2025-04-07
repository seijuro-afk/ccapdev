const mongoose = require("mongoose");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");

// Ensure registerUser is defined
exports.registerUser = async (req, res) => {
    try {
        console.log("Received user data:", req.body);

        let { username, email, password, confirm_password, id_number, college, bio } = req.body;

        /*
        // Convert array values to strings if necessary
        username = Array.isArray(username) ? username[0] : username;
        email = Array.isArray(email) ? email[0] : email;
        password = Array.isArray(password) ? password[0] : password;
        confirm_password = Array.isArray(confirm_password) ? confirm_password[0] : confirm_password;
        id_number = Array.isArray(id_number) ? id_number[0] : id_number;
        college = Array.isArray(college) ? college[0] : college;
        bio = Array.isArray(bio) ? bio[0] : bio;
        */
        // Check if passwords match
        if (password !== confirm_password) {
            console.log("Passwords do not match.");
            return res.status(400).render("signup", {
                title: "Sign Up",
                brandName: "AnimoBUZZ",
                errorMessage: "Passwords do not match"
            });
        }

        // Check if username or email already exists
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            console.log("Username or email already exists.");
            return res.status(400).render("signup", {
                title: "Sign Up",
                brandName: "AnimoBUZZ",
                errorMessage: "Username or email already exists"
            });
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate a unique user_id
        const user_id = new mongoose.Types.ObjectId();

        // Save hashed password, not the plaintext one
        const newUser = new User({
            user_id,
            username,
            email,
            password: hashedPassword,
            id_number,
            college,
            bio
        });

        await newUser.save();

        console.log("User successfully registered:", newUser);
        res.redirect("/login");
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.loginUser = async (req, res) => {
    try {
        console.log("Raw request body:", req.body); // Add this line
        let { email, password } = req.body;

        // Debug what's coming in before any processing
        console.log("Original email:", email);
        console.log("Original password:", password);
        console.log("Password type:", typeof password);

        // Fix potential array values
        email = Array.isArray(email) ? email[0] : email;
        password = Array.isArray(password) ? password[0] : password;

        // Debug after processing
        console.log("Processed email:", email);
        console.log("Processed password:", password);
        console.log("Processed password length:", password.length);


        const user = await User.findOne({ email });

        if (!user) {
            console.log("User not found.");
            return res.status(400).render("signup", {
                title: "Sign Up",
                brandName: "AnimoBUZZ",
                errorMessage: "Invalid email or password."
            });
        }

        console.log("User found. Stored hash:", user.password);
        console.log("Stored hash length:", user.password.length);

        const isMatch = await bcrypt.compare(password, user.password);
        console.log("Password match?", isMatch);

        if (!isMatch) {
            console.log("Invalid password.");
            return res.status(400).render("signup", {
                title: "Sign Up",
                brandName: "AnimoBUZZ",
                errorMessage: "Invalid email or password."
            });
        }

        req.session.user = { username: user.username, email: user.email };
        console.log("Session set:", req.session.user);

        req.session.save(err => {
            if (err) {
                console.error("Error saving session:", err);
                return res.status(500).json({ error: "Session error" });
            }
            res.redirect("/");
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
