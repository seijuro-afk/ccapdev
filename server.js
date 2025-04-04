const express = require("express");
const session = require('express-session');
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;
const path = require("path");
const exphbs = require("express-handlebars");
require("dotenv").config();

// Models
const Post = require("./models/postModel");
const User = require("./models/userModel");
const Comment = require("./models/commentModel"); 

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/")
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("MongoDB connection error:", err));

    const hbs = exphbs.create({
        extname: ".hbs",
        defaultLayout: "main",
        layoutsDir: path.join(__dirname, "views/layouts"),
        partialsDir: [
            path.join(__dirname, "views/partials"), // Primary partials directory
            path.join(__dirname, "views/components") // Optional additional directory
        ],
        helpers: {
            eq: (a, b) => a === b,
            subtract: (a, b) => a - b,
            formatDate: (date) => {
                if (!date) return '';
                return new Date(date).toLocaleString();
            },
            toString: (value) => value?.toString(),
            json: (context) => JSON.stringify(context, null, 2) // Useful for debugging
        }
    });

app.engine("hbs", hbs.engine); // Set up the Handlebars engine
app.set("view engine", "hbs"); // Set Handlebars as the view engine
app.set("views", path.join(__dirname, "views")); // Specify the views directory

// Set up middleware
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(express.json()); // Parse JSON bodies
app.use(express.static(path.join(__dirname, "public"))); // Serve static files (CSS, JS, images)

// Session setup 
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Middleware to make user session available to all views
app.use((req, res, next) => {
    res.locals.showNavbar = true; // Show the navbar by default
    res.locals.user = req.session.user || null; // Ensure it's `null` if undefined
    next();
});


// Route to render the homepage
app.get("/", async (req, res) => {
    try {
        const posts = await Post.find().lean(); // Fetch posts from MongoDB
        res.render("homepage", {
            title: "AnimoBuzz - Home",
            brandName: "AnimoBuzz",
            sidebarLinks: [
                { label: "Home", url: "/", active: true },
                { label: "For You", url: "/fyp" },
                { label: "Profile", url: "/user-profile" },
                { label: "Communities", url: "/communities" }
            ],
            posts, // Pass MongoDB posts
            trendingTopics: ["#BeeLine", "#AnimoBuzz", "#LatestNews"]
        });
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Route to render the communities page
app.get("/communities", (req, res) => {
    res.render("communities", {
        title: "Communities",
        brandName: "AnimoBuzz",
        communities: [
            {
                id: 1,
                name: "Awesome Community",
                description: "This is a description of the awesome community."
            },
            {
                id: 2,
                name: "Tech Enthusiasts",
                description: "A community for tech lovers."
            },
            {
                id: 3,
                name: "Book Club",
                description: "A community for book lovers."
            }
        ]
    });
});

app.get("/communities/:id", (req, res) => {
    const communityId = parseInt(req.params.id, 10);

    // Sample data for communities
    const communities = [
        {
            id: 1,
            name: "Awesome Community",
            description: "This is a description of the awesome community.",
            joinButtonText: "Join",
            tabs: [
                { id: "discussions", label: "Discussions" },
                { id: "events", label: "Events" },
                { id: "members", label: "Members" }
            ],
            discussions: [
                { title: "Discussion 1", link: "/discussionthread" },
                { title: "Discussion 2", link: "/discussionthread" }
            ],
            events: ["Event 1", "Event 2"],
            members: ["Member 1", "Member 2", "Member 3"],
            activeTab: {
                discussions: true,
                events: false,
                members: false
            }
        },
        {
            id: 2,
            name: "Tech Enthusiasts",
            description: "A community for tech lovers.",
            joinButtonText: "Join",
            tabs: [
                { id: "discussions", label: "Discussions" },
                { id: "events", label: "Events" },
                { id: "members", label: "Members" }
            ],
            discussions: [
                { title: "Tech Discussion 1", link: "/discussionthread" },
                { title: "Tech Discussion 2", link: "/discussionthread" }
            ],
            events: ["Tech Event 1", "Tech Event 2"],
            members: ["Tech Member 1", "Tech Member 2", "Tech Member 3"],
            activeTab: {
                discussions: true,
                events: false,
                members: false
            }
        },
        {
            id: 3,
            name: "Book Club",
            description: "A community for book lovers.",
            joinButtonText: "Join",
            tabs: [
                { id: "discussions", label: "Discussions" },
                { id: "events", label: "Events" },
                { id: "members", label: "Members" }
            ],
            discussions: [
                { title: "Book Discussion 1", link: "/discussionthread" },
                { title: "Book Discussion 2", link: "/discussionthread" }
            ],
            events: ["Book Event 1", "Book Event 2"],
            members: ["Book Member 1", "Book Member 2", "Book Member 3"],
            activeTab: {
                discussions: true,
                events: false,
                members: false
            }
        }
    ];

    // Find the community by ID
    const community = communities.find(c => c.id === communityId);

    if (community) {
        res.render("community-details", {
            title: community.name,
            brandName: "AnimoBuzz",
            ...community
        });
    } else {
        res.status(404).send("Community not found");
    }
});

// route to render the discussion thread page
app.get("/discussionthread", (req, res) => {
    res.render("discussionthread", {
        title: "Discussion Thread",
        brandName: "AnimoBuzz",
        discussion: {
            title: "Sample Discussion",
            author: "User123",
            date: "October 10, 2023",
            content: "This is the original post content.",
            replies: [
                { content: "This is a reply." },
                { content: "This is another reply." }
            ]
        },
        relatedDiscussions: [
            { title: "Related Discussion 1", link: "/discussion/1" },
            { title: "Related Discussion 2", link: "/discussion/2" }
        ]
    });
});

app.get("/fyp", (req, res) => {
    res.render("fyp", {
        title: "For You Page",
        brandName: "AnimoBuzz",
        pageTitle: "For You",
        subheading: "Trending & Personalized Posts",
        followedTopics: [
            { id: 1, name: "Campus Life" },
            { id: 2, name: "Food & Dining" }
        ],
        recommendedTopics: [
            { id: 3, name: "Academics" },
            { id: 4, name: "Sports" }
        ],
        feedItems: [
            { title: "Best food stalls near Henry Sy?", author: "@foodieDLSU", upvotes: 25 },
            { title: "Is the Andrew Hall study lounge open 24/7?", author: "@studentlife", upvotes: 18 }
        ]
    });
});

app.get('/user-profile/:userId?', async (req, res) => {
    try {
        const userId = req.params.userId || req.session.user?._id;
        if (!userId) return res.redirect('/login');

        // Find user and their posts
        const user = await User.findById(userId).lean();
        // Fetch user's posts
        const posts = await Post.find({ authorId:userId }).lean(); 
            res.render('user-profile', {
                user: {
                    name: user.username,
                    avatar: user.pfp_url || "/images/default-avatar.jpg",
                    email: user.email,
                    username: user.username,
                    id_number: user.id_number,
                    college: user.college,
                    program: user.program,
                    bio: user.bio
                },
                posts: posts.map(post => ({
                    _id: post._id,
                    content: post.content,
                    createdAt: post.createdAt,
                    upvotes: post.upvotes || 0,
                    downvotes: post.downvotes || 0,
                    authorId: post.authorId.toString(),
                    currentUserVote: "none" // Modify this logic as per voting system
                }))
            });
    } catch (error) {
        console.error("Error loading user profile:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Login route (GET)
app.get("/login", (req, res) => {
    res.locals.showNavbar = false; // Hide the navbar on the login page
    res.render("login", {
        title: "Login",
        brandName: "AnimoBuzz",
        errorMessage: req.query.error
    });
});

// Login Route (POST) - MongoDB Version
app.post('/users/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Find user by email
        const user = await User.findOne({ email });

        // 2. Check if user exists
        if (!user) {
            return res.redirect('/login?error=Invalid email or password');
        }

        // 3. Verify password (basic comparison - use bcrypt in production)
        if (user.password !== password) {
            return res.redirect('/login?error=Invalid email or password');
        }

        // 4. Create session
        req.session.user = {
            _id: user._id,
            email: user.email,
            username: user.username,
            user_id: user.user_id
        };

        // 5. Redirect to homepage
        res.redirect('/');

    } catch (error) {
        console.error('Login error:', error);
        res.redirect('/login?error=Server error');
    }
});

// Logout route
app.get("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect("/");
        }
        res.redirect("/login");
    });
});

app.get("/signup", (req, res) => {
    res.locals.showNavbar = false;
    res.render("signup", {
        title: "Sign Up",
        brandName: "AnimoBuzz"
    });
});

// POST route for signup form submission
app.post("/signup", (req, res) => {
    const { Name, email, password, confirm_password, id_number, college, username, bio } = req.body;

    // Validate input fields
    if (password !== confirm_password) {
        return res.redirect("/signup?error=Passwords do not match");
    }

    const newUser = {
        Name,
        email,
        password, 
        id_number,
        college,
        username,
        bio
    };

    console.log("New user:", newUser);
    res.redirect("/login");
});


// Upvote route
app.post('/api/posts/:postId/upvote', async (req, res) => {
    try {
        if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });

        const post = await Post.findById(req.params.postId);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        // Check if user already voted
        const existingVote = post.voters.find(v => 
            v.user.toString() === req.session.user._id.toString()
        );

        if (existingVote) {
            if (existingVote.voteType === 'upvote') {
                // Remove upvote
                post.upvotes--;
                post.voters = post.voters.filter(v => 
                    v.user.toString() !== req.session.user._id.toString()
                );
            } else {
                // Change from downvote to upvote
                post.downvotes--;
                post.upvotes++;
                existingVote.voteType = 'upvote';
            }
        } else {
            // Add new upvote
            post.upvotes++;
            post.voters.push({
                user: req.session.user._id,
                voteType: 'upvote'
            });
        }

        await post.save();
        res.json({
            upvotes: post.upvotes,
            downvotes: post.downvotes,
            netVotes: post.upvotes - post.downvotes,
            currentUserVote: existingVote?.voteType || null
        });
    } catch (error) {
        console.error('Upvote error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/posts/:postId/downvote', async (req, res) => {
    try {
        if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });

        const post = await Post.findById(req.params.postId);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        const existingVote = post.voters.find(v => 
            v.user.toString() === req.session.user._id.toString()
        );

        if (existingVote) {
            if (existingVote.voteType === 'downvote') {
                post.downvotes--;
                post.voters = post.voters.filter(v => 
                    v.user.toString() !== req.session.user._id.toString()
                );
            } else {
                post.upvotes--;
                post.downvotes++;
                existingVote.voteType = 'downvote';
            }
        } else {
            post.downvotes++;
            post.voters.push({
                user: req.session.user._id,
                voteType: 'downvote'
            });
        }

        await post.save();
        res.json({
            upvotes: post.upvotes,
            downvotes: post.downvotes,
            netVotes: post.upvotes - post.downvotes,
            currentUserVote: existingVote?.voteType || null
        });
    } catch (error) {
        console.error('Downvote error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Import Routes
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");

// Register Routes
app.use("/users", userRoutes); // Now all /users routes will work
app.use("/posts", postRoutes);   // Handles all /posts routes
app.use("/comments", commentRoutes); // Handles all /comments routes


// Delete Post Route (already in your server.js)
app.delete('/api/posts/:postId', async (req, res) => {
    try {
        const postId = req.params.postId;

        // Find post first to verify ownership
        const post = await Post.findById(postId);
        
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
               
        // Delete the post
        await Post.findByIdAndDelete(postId);
        
        // Optionally delete associated comments
        await Comment.deleteMany({ post: postId });
        
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/api/users/delete-account', async (req, res) => {
    try {
        const userId = req.session.user?._id;
        
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Verify the user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Delete all user's posts and comments
        await Promise.all([
            Post.deleteMany({ authorId: userId }),
            Comment.deleteMany({ authorId: userId })
        ]);

        // Delete the user account
        await User.findByIdAndDelete(userId);

        // Destroy session
        req.session.destroy(err => {
            if (err) {
                console.error('Session destruction error:', err);
                return res.status(500).json({ error: 'Error logging out' });
            }
            
            // Clear the session cookie
            res.clearCookie('connect.sid');
            res.status(200).json({ message: 'Account deleted successfully' });
        });

    } catch (error) {
        console.error('Account deletion error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put("/api/posts/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid post ID" });
        }

        if (!content || content.trim() === "") {
            return res.status(400).json({ error: "Post content cannot be empty" });
        }

        const updatedPost = await Post.findByIdAndUpdate(
            id,
            { content },
            { new: true, runValidators: true }
        );

        if (!updatedPost) {
            return res.status(404).json({ error: "Post not found" });
        }

        res.json(updatedPost);
    } catch (error) {
        console.error("Error updating post:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// Route to handle profile update
app.put('/api/users/update-profile', async (req, res) => {
    try {
        // Check if user is logged in
        if (!req.session.user) {
            return res.status(401).json({ error: 'Unauthorized - Please log in' });
        }

        const userId = req.session.user._id;
        const { 
            username, 
            email, 
            currentPassword, 
            newPassword, 
            college, 
            id_number, 
            bio, 
            pfp_url 
        } = req.body;


        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Prepare update object
        const updates = {};
        
        if (id_number) updates.id_number = id_number;

        // Update username if provided and different
        if (username && username !== user.username) {
            // Check if new username is already taken
            const usernameExists = await User.findOne({ 
                username, 
                _id: { $ne: userId } // Exclude current user
            });
            if (usernameExists) {
                return res.status(400).json({ error: 'Username already taken' });
            }
            updates.username = username;
        }

        // Update email if provided and different
        if (email && email !== user.email) {
            // Check if new email is already taken
            const emailExists = await User.findOne({ 
                email, 
                _id: { $ne: userId } // Exclude current user
            });
            if (emailExists) {
                return res.status(400).json({ error: 'Email already in use' });
            }
            updates.email = email;
        }

        // Update password if current password is verified
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ error: 'Current password is required to change password' });
            }
            
            // Verify current password (plain text comparison - in production use bcrypt.compare)
            if (currentPassword !== user.password) {
                return res.status(401).json({ error: 'Current password is incorrect' });
            }
            
            updates.password = newPassword;
        }

        // Update other fields if provided
        if (college) updates.college = college;
        if (bio) updates.bio = bio;
        if (pfp_url) updates.pfp_url = pfp_url;

        // If no updates were provided
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'No changes provided' });
        }

        // Perform the update
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updates,
            { new: true, runValidators: true }
        ).select('-password'); // Exclude password from the returned user object

        // Update session if username or email changed
        if (updates.username || updates.email) {
            req.session.user = {
                ...req.session.user,
                username: updatedUser.username,
                email: updatedUser.email
            };
        }

        res.json({
            message: 'Profile updated successfully',
            user: updatedUser
        });

    }catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).send('Something went wrong!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});