const mongoose = require("mongoose");
const Post = require("../models/postModel");
const Comment = require("../models/commentModel");

exports.createPost = async (req, res) => {
    try {
        const { content } = req.body;
        
        // Get user info from session
        const user = req.session.user;
        if (!user) {
            return res.status(401).redirect('/login');
        }

        const newPost = new Post({
            author: user.username || "Anonymous", // Use username if available
            authorEmail: user.email, // Store the email
            content: content,
            upvotes: 0,
            downvotes: 0,
            authorId: user._id, // Store user ID for reference
            comments: [] // Initialize the comments array as empty
        });
        
        
        await newPost.save();
        res.redirect("/");
    } catch (error) {
        console.error("Error creating post:", error);
        res.status(500).send("Internal Server Error");
    }
    
    const addComment = async (postId, author, content) => {
        const post = await Post.findById(postId);
        if (post) {
            const newComment = {
                author: author,
                content: content,
                createdAt: new Date()
            };
            post.comments.push(newComment);
            await post.save();
        }
    };
    
};

exports.getAllPosts = async (req, res) => {
    try {
        const { sort } = req.query;
        let sortOption = { createdAt: -1 }; // Default: newest first
        
        if (sort === 'popular') {
            sortOption = { upvotes: -1 };
        } else if (sort === 'oldest') {
            sortOption = { createdAt: 1 };
        } else if (sort === 'controversial') {
            // For controversial posts, sort by the sum of upvotes and downvotes
            // This shows posts with the most engagement (both positive and negative)
            sortOption = { upvotes: 1, downvotes: 1 };
        }

        const posts = await Post.find().lean().sort(sortOption);

        for (let post of posts) {
            post.comments = await Comment.find({ postId: new mongoose.Types.ObjectId(post._id) }).lean();
            
            // Add these lines to include author info in each post
            post.isCurrentUserAuthor = req.session.user?._id?.toString() === post.authorId?.toString();
            post.currentUserVote = post.voters?.find(v => 
                v.user?.toString() === req.session.user?._id?.toString()
            )?.voteType;
        }

        res.render("homepage", {
            title: "AnimoBuzz - Home",
            brandName: "AnimoBuzz",
            posts,
            user: req.session.user // Pass user to template
        });
    } catch (error) {
        console.error("Error fetching posts and comments:", error);
        res.status(500).send("Internal Server Error");
    }
};

// Enhanced votePost controller
exports.votePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { type } = req.body;
        const userId = req.session.user?._id;

        if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

        const post = await Post.findById(id);
        if (!post) return res.status(404).json({ success: false, message: "Post not found" });

        // Initialize voters array if it doesn't exist
        post.voters = post.voters || [];

        // Check if user already voted
        const existingVoteIndex = post.voters.findIndex(v => 
            v.user.toString() === userId.toString()
        );

        if (existingVoteIndex !== -1) {
            // User already voted - check if same vote type
            const existingVote = post.voters[existingVoteIndex];
            if (existingVote.voteType === type) {
                // Remove vote
                if (type === "upvote") post.upvotes -= 1;
                if (type === "downvote") post.downvotes -= 1;
                post.voters.splice(existingVoteIndex, 1);
            } else {
                // Change vote type
                if (existingVote.voteType === "upvote") {
                    post.upvotes -= 1;
                    post.downvotes += 1;
                } else {
                    post.downvotes -= 1;
                    post.upvotes += 1;
                }
                existingVote.voteType = type;
            }
        } else {
            // New vote
            if (type === "upvote") post.upvotes += 1;
            if (type === "downvote") post.downvotes += 1;
            post.voters.push({
                user: userId,
                voteType: type
            });
        }

        await post.save();
        res.json({ 
            success: true, 
            upvotes: post.upvotes, 
            downvotes: post.downvotes,
            netVotes: post.upvotes - post.downvotes,
            currentUserVote: type
        });
    } catch (error) {
        console.error("Error voting on post:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};