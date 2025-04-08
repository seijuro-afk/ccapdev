const express = require("express");
const session = require('express-session');
const bcrypt = require("bcrypt");
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
mongoose.connect("mongodb+srv://seanregindin:vhzjBONAcFo5ii6L@animobuzz.veaof.mongodb.net/")
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
                return new Date(date).toLocaleString(); //
            },
            toString: (value) => value?.toString(),
            json: (context) => JSON.stringify(context, null, 2), // Useful for debugging
            includes: (array, value) => {
                if (!array) return false;
                return array.includes(value?.toString());
            }
        }
    });

app.engine("hbs", hbs.engine); // Set up the Handlebars engine
app.set("view engine", "hbs"); // Set Handlebars as the view engine
app.set("views", path.join(__dirname, "views")); // Specify the views directory

// Set up middleware
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(express.json()); // Parse JSON bodies
app.use(express.static(path.join(__dirname, "public"), {
    setHeaders: (res, path) => {
        if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
    }
})); // Serve static files with proper headers

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false, // Changed from true to false for security
    cookie: { 
        secure: false, // Set to true if using HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    }

}));

// Middleware to make user session available to all views
app.use((req, res, next) => {
    res.locals.showNavbar = true; // Show the navbar by default
    res.locals.user = req.session.user || null; // Ensure it's `null` if undefined
    next();
});

const sampleUsers = [
    { username: 'spongebob', password: 'password1', email: 'spongebob@example.com' },
    { username: 'patrick', password: 'password2', email: 'patrick@example.com' },
    { username: 'squidward', password: 'password3', email: 'squidward@example.com' },
    { username: 'sandy', password: 'password4', email: 'sandy@example.com' },
    { username: 'krabs', password: 'password5', email: 'krabs@example.com' }
  ];

    // Import Routes
    const userRoutes = require("./routes/userRoutes");
    const postRoutes = require("./routes/postRoutes");
    const commentRoutes = require("./routes/commentRoutes");
    const communityRoutes = require("./routes/communityRoutes");

    // Register Routes
    app.use("/users", userRoutes); // Now all /users routes will work
    app.use("/posts", postRoutes);   // Handles all /posts routes
    app.use("/comments", commentRoutes); // Handles all /comments routes
    app.use("/communities", communityRoutes); // Handles all /communities routes
    
  // Ensure sample users and posts are created on server start
  async function createSampleUsersAndPosts() {
    for (let user of sampleUsers) {
      const existingUser = await User.findOne({ username: user.username });
      if (!existingUser) {
        const newUser = await User.create(user);
        for (let i = 1; i <= 5; i++) {
          const post = await Post.create({
            authorId: newUser._id,
            content: `Post content ${i} by ${newUser.username}`,
            upvotes: Math.floor(Math.random() * 100),
            downvotes: Math.floor(Math.random() * 100)
          });
  
          // Create 5 comments for each post
          for (let j = 1; j <= 5; j++) {
            await Comment.create({
              postId: post._id,
              author: `Commenter ${j}`,
              content: `Comment ${j} on post ${i} by ${newUser.username}`,
              created_at: new Date()
            });
          }
        }
      }
    }
  }
  

app.get("/", async (req, res) => {
    try {
        // Populate author information when fetching posts
        const posts = await Post.find()
        .sort({ created_at: -1 }) // Sort by created_at field in descending order (-1)
        .populate('authorId', 'username pfp_url') // Get authorId and pfp_url
        .populate('comments')
        .lean();

            
        // Process posts to ensure pfp_url is available
        const processedPosts = posts.map(post => {
            return {
                ...post,
                // Use either the populated authorId.pfp_url or fall back to post.avatar
                displayPfp: post.authorId?.pfp_url || post.avatar || "/images/spongebob.jpg",
                // Format comment dates if needed
                comments: post.comments?.map(comment => ({
                    ...comment,
                    created_at: new Date(comment.created_at).toLocaleString()
                })) || []
            };
        });

        res.render("homepage", {
            title: "AnimoBuzz - Home",
            brandName: "AnimoBuzz",
            sidebarLinks: [
                { label: "Home", url: "/", active: true },
                { label: "For You", url: "/fyp" },
                { label: "Profile", url: `/user-profile/${req.session.user?._id || ''}` },
                { label: "Communities", url: "/communities" }
            ],
            posts: processedPosts,
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
app.get("/discussionthread/:postId", async (req, res) => {
    try {
        const postId = req.params.postId;
        
        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).send("Invalid post ID");
        }

        // Fetch post with author details and populated comments
        const post = await Post.findById(postId)
            .populate('authorId', 'username pfp_url')
            .populate({
                path: 'comments',
                populate: {
                    path: 'authorId',
                    select: 'username pfp_url'
                }
            })
            .lean();

        if (!post) {
            return res.status(404).send("Post not found");
        }

        // Format comments as replies
        const replies = post.comments.map(comment => ({
            content: comment.content,
            author: comment.authorId?.username || 'Unknown',
            authorAvatar: comment.authorId?.pfp_url || '/images/default-avatar.jpg',
            date: comment.createdAt
        }));

        res.render("discussionthread", {
            title: "Discussion Thread",
            brandName: "AnimoBuzz",
            discussion: {
                title: post.content.substring(0, 50) + (post.content.length > 50 ? '...' : ''),
                author: post.authorId?.username || 'Unknown',
                authorAvatar: post.authorId?.pfp_url || '/images/default-avatar.jpg',
                date: post.createdAt,
                content: post.content,
                replies: replies
            },
            relatedDiscussions: [] // Can be populated with real related posts later
        });
    } catch (error) {
        console.error("Error loading discussion thread:", error);
        res.status(500).send("Internal Server Error");
    }
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
        // Get user ID from params or session
        let userId = req.params.userId;
        
        if (!userId && req.session.user?._id) {
            userId = req.session.user._id;
        }
        
        if (!userId) {
            return res.redirect('/login?error=Please login to view profile');
        }

        // Convert to ObjectId if not already
        const userIdObj = new mongoose.Types.ObjectId(userId);

        const user = await User.findById(userIdObj).lean();
        
        if (!user) {
            return res.status(404).render('error', { 
                message: 'User not found',
                brandName: "AnimoBuzz"
            });
        }

        const posts = await Post.find({ authorId: userIdObj })
            .sort({ createdAt: -1 })
            .lean();
        

        // Format posts for template
        const formattedPosts = posts.map(post => ({

            _id: post._id.toString(),
            content: post.content,
            createdAt: post.createdAt,
            upvotes: post.upvotes || 0,
        }));

        res.render('user-profile', {
            title: `${user.username}'s Profile`,
            brandName: "AnimoBuzz",
            user: {
                ...user,
                id_number: user.id_number || 'N/A',
                college: user.college || 'Not specified',
                bio: user.bio || '',
                avatar: user.pfp_url || "/images/default-avatar.jpg",
                isCurrentUser: (!req.params.userId || req.params.userId === req.session.user?._id?.toString())
            },
            posts: formattedPosts,
            sidebarLinks: [
                { label: "Home", url: "/", active: false },
                { label: "For You", url: "/fyp", active: false },
                { label: "Profile", url: `/user-profile/${req.session.user?._id}`, active: true },
                { label: "Communities", url: "/communities", active: false }
            ],
            // Add these helpers if not already registered globally
            helpers: {
                eq: (a, b) => a === b,
                subtract: (a, b) => a - b,
                formatDate: (date) => new Date(date).toLocaleString()
            }
        });

    } catch (error) {
        console.error("Error loading user profile:", error);
        console.error(error.stack);
        res.status(500).render('error', { 
            message: 'Internal Server Error',
            brandName: "AnimoBuzz"
        });
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

// Login Route (POST) 
app.post('/users/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.redirect('/login?error=Invalid credentials');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.redirect('/login?error=Invalid credentials');
        }

         req.session.user = {
                    _id: user._id,
                    email: user.email,
                    username: user.username,
                    user_id: user.user_id
        };
        console.log('User session:', req.session.user); // Debugging: Log user session
        // Save session before redirect
        req.session.save(err => {
            if (err) {
                console.error('Session save error:', err);
                return res.redirect('/login?error=Session error');
            }
            res.redirect('/');
        });

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
app.post("/signup", async (req, res) => {
    const { Name, email, password, confirm_password, id_number, college, username, bio } = req.body;

    // Validate input fields
    if (password !== confirm_password) {
        return res.redirect("/signup?error=Passwords do not match");
    }

    try {
        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.redirect("/signup?error=Email already in use");
        }

        // Check if username already exists
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.redirect("/signup?error=Username already taken");
        }

        // Create new user (password will be hashed by pre-save hook)
        const newUser = new User({
            username,
            email,
            password, // Will be hashed automatically
            id_number,
            college,
            bio: bio || "",
            pfp_url: "/images/default-avatar.jpg"
        });

        await newUser.save();

        // Redirect to login with success message
        res.redirect("/login?signup=success");
        
    } catch (error) {
        console.error("Signup error:", error);
        res.redirect("/signup?error=Registration failed");
    }
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
    console.log(`Server running at http://localhost:${PORT}`);
});
