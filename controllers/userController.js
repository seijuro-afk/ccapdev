const mongoose = require("mongoose");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const Post = require("../models/postModel");

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

        /*
        // Generate a unique user_id
        const user_id = new mongoose.Types.ObjectId();
        */
        
        // Save hashed password, not the plaintext one
        const newUser = new User({
            //user_id,
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


        // Fix potential array values
        email = Array.isArray(email) ? email[0] : email;
        password = Array.isArray(password) ? password[0] : password;


        const user = await User.findOne({ email });

        if (!user) {
            console.log("User not found.");
            return res.status(400).render("signup", {
                title: "Sign Up",
                brandName: "AnimoBUZZ",
                errorMessage: "Invalid email or password."
            });
        }


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

        req.session.user = {
            _id: user._id,
            email: user.email,
            username: user.username,
            user_id: user.user_id,
            loggedIn: true,
            pfp_url: user.pfp_url
        };
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
        // Debugging: Log session info
        console.log('Session data:', req.session);
        
        // Get user ID from params or session
        let userId = req.params.userId;
        
        // If no userId in params, try to get from session
        if (!userId && req.session.user?._id) {
            userId = req.session.user._id;
        }
        
        // If still no userId, redirect to login
        if (!userId) {
            console.log('No user ID found - redirecting to login');
            return res.redirect('/login?error=Please login to view profile');
        }

        // Find user and their posts
        const user = await User.findById(userId).lean();
        if (!user) {
            return res.status(404).render('error', { 
                message: 'User not found',
                brandName: "AnimoBuzz"
            });
        }

        const posts = await Post.find({ authorId: userId })
            .sort({ createdAt: -1 })
            .lean();

        console.log(posts);

        res.render('user-profile', {
            title: `${user.username}'s Profile`,
            brandName: "AnimoBuzz",
            user: {
                ...user,
                avatar: user.pfp_url || "/images/default-avatar.jpg",
                isCurrentUser: (!req.params.userId || req.params.userId === req.session.user?._id?.toString())
            },
            posts: posts.map(post => ({
                _id: post._id,
                content: post.content,
                createdAt: post.createdAt,
                upvotes: post.upvotes || 0,
                downvotes: post.downvotes || 0,
                authorId: post.authorId.toString(),
                currentUserVote: "none" // Modify this logic as per voting system
            })),
            sidebarLinks: [
                { label: "Home", url: "/", active: false },
                { label: "For You", url: "/fyp", active: false },
                { label: "Profile", url: `/user-profile/${userId}`, active: true },
                { label: "Communities", url: "/communities", active: false }
            ]
        });
    } catch (error) {
        console.error("Error loading user profile:", error);
        res.status(500).render('error', { 
            message: 'Internal Server Error',
            brandName: "AnimoBuzz"
        });
    }
};
