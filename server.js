const express = require("express");
const session = require('express-session');
const mongoose = require("mongoose");
const path = require("path");
const exphbs = require("express-handlebars");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/forumDB")
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch(err => console.error("❌ MongoDB connection error:", err));

// Set up Handlebars
const hbs = exphbs.create({
    extname: ".hbs", // Use .hbs as the file extension
    defaultLayout: "main", // Use main.hbs as the default layout
    layoutsDir: path.join(__dirname, "views/layouts"), // Specify the layouts directory
    partialsDir: path.join(__dirname, "views/partials") // Specify the partials directory
});

app.engine("hbs", hbs.engine); // Set up the Handlebars engine
app.set("view engine", "hbs"); // Set Handlebars as the view engine
app.set("views", path.join(__dirname, "views")); // Specify the views directory

// Set up middleware
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(express.json()); // Parse JSON bodies
app.use(express.static(path.join(__dirname, "public"))); // Serve static files (CSS, JS, images)

// Session setup (place this before routes)
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Middleware to make user session available to all views
app.use((req, res, next) => {
    res.locals.showNavbar = true; // Show the navbar by default
    res.locals.user = req.session.user;
    next();
});

// Route to render the homepage
app.get("/", (req, res) => {
    res.render("homepage", {
        title: "AnimoBuzz - Home",
        brandName: "AnimoBuzz",
        sidebarLinks: [
            { label: "Home", url: "/", active: true },
            { label: "For You", url: "/fyp" },
            { label: "Profile", url: "/user-profile" },
            { label: "Communities", url: "/communities" }
        ],
        posts: [
            { author: "Spongebob Squarepants", content: "BAYAYAYYA #BeeLine", avatar: "/images/spongebob.jpg" },
            { author: "Patrick Star", content: "Huuuh #BeeLine", avatar: "/images/patrick.jpg" },
            { author: "Squidward", content: "Spongebob!!! #BeeLine", avatar: "/images/squidward.jpg" },
            { author: "Mr. Krabs", content: "$$$$$$ #BeeLine", avatar: "/images/krabs.jpg" },
            { author: "Plankton", content: "Give me the secret recipe! #BeeLine", avatar: "/images/Plankton.jpg" },
            { author: "Anonymous", content: "Meep #BeeLine" }
        ],
        trendingTopics: ["#BeeLine", "#AnimoBuzz", "#LatestNews"]
    });
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

// Route to render the user profile page
app.get("/user-profile", (req, res) => {
    res.render("user-profile", {
        title: "User Profile - AnimoBuzz",
        brandName: "AnimoBuzz",
        sidebarLinks: [
            { label: "Home", url: "/", active: false },
            { label: "For You", url: "/fyp", active: false },
            { label: "Profile", url: "/profile", active: true },
            { label: "Communities", url: "/communities", active: false }
        ],
        user: {
            avatar: "/images/spongebob.jpg",
            name: "Spongebob",
            username: "johndoe",
            id: "123",
            college: "College of Computer Studies",
            program: "BSCS",
            bio: "Aspiring software engineer and tech enthusiast!"
        },
        tabs: [
            { id: "posts", label: "Posts", active: true },
            { id: "events", label: "Events", active: false },
            { id: "discussions", label: "Discussions", active: false }
        ],
        posts: [
            { content: 'Public Post: "Best study spots in DLSU?"' },
            { content: 'Anonymous Post: "How to manage my schedule better?"' }
        ],
        events: [],
        discussions: [],
        quickLinks: ["Settings", "Privacy", "Help Center"],
        activeTab: {
            posts: true,
            events: false,
            discussions: false
        }
    });
});


app.get("/signup", (req, res) => {
    res.locals.showNavbar = false;
    res.render("signup", {
        title: "Sign Up",
        brandName: "AnimoBuzz"
    });
});


// Session setup
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Middleware to make user session available to all views
app.use((req, res, next) => {
    res.locals.user = req.session.user;
    next();
});

// Login route (GET)
app.get("/login", (req, res) => {
    res.render("login", {
        title: "Login",
        brandName: "AnimoBuzz",
        errorMessage: req.query.error
    });
});

// Login route (POST)
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    // Example: Check if username and password are valid
    if (username === "admin" && password === "password") {
        // Set user session
        req.session.user = { username: username };
        // Redirect to the homepage on successful login
        res.redirect("/");
    } else {
        // Redirect back to the login page with an error message
        res.redirect("/login?error=Invalid username or password");
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

// Home route
app.get("/", (req, res) => {
    res.render("home", {
        title: "Home",
        brandName: "AnimoBuzz"
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});