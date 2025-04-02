// Connect to MongoDB
use forumDB;

// Create Users Collection
db.createCollection("users");
db.users.insertMany([
    { 
        email: "admin@gmail.com",
        username: "admin", 
        user_id: "@admin123",  // Unique user identifier
        id: 123,  // Not unique (multiple users can have the same)
        password: "12345678", 
        bio: "College of Computer Studies - BSCS", 
        joined_at: new Date(),
    },
    { 
        username: "Spongebob Squarepants", 
        user_id: "@johndoe",  
        id: 123,  // Same ID as admin (allowed)
        password: "hashed_password", 
        bio: "College of Computer Studies - BSCS", 
        joined_at: new Date(),
        pfp_url: "../images/spongebob.jpg" 
    },
    { 
        username: "Patrick Star", 
        user_id: "@patrick456",  
        id: 122,  // Different ID
        password: "hashed_password", 
        bio: "Underwater Studies - BFA", 
        joined_at: new Date(),
        pfp_url: "../images/patrick.jpg" 
    }
]);

// Create Posts Collection
db.createCollection("posts");
db.posts.insertMany([
    { 
        post_id: ObjectId(),  // Unique identifier for each post
        content: "This is my first post! #BeeLine", 
        author: "@johndoe",  
        created_at: new Date(),
        likes: 0,
        comments: []
    },
    { 
        post_id: ObjectId(),  
        content: "Loving this forum! 🚀", 
        author: "@johndoe",  
        created_at: new Date(),
        likes: 0,
        comments: []
    }
]);

// Fetch the `_id` of a specific post by the user
let post = db.posts.findOne({ author: "@johndoe" });

// Create Comments Collection
db.createCollection("comments");
// Insert Comment Linked to a Specific Post
db.comments.insertOne({ 
    comment_id: ObjectId(), // Unique identifier for the comment
    post_id: post.post_id,  // Correctly links to the existing post
    author: "@spongebob123", // References user_id
    content: "This forum looks great!", 
    created_at: new Date() 
});

// Indexes for Performance
db.users.createIndex({ user_id: 1 }, { unique: true });
db.posts.createIndex({ post_id: 1 }, { unique: true }); // Ensures unique post_id
db.comments.createIndex({ comment_id: 1 }, { unique: true }); // Ensures unique comment_id
db.comments.createIndex({ post_id: 1 });
