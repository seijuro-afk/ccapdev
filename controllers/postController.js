const mongoose = require("mongoose");
const Post = require("../models/postModel");
const Comment = require("../models/commentModel");

exports.createPost = async (req, res) => {
    try {
        const { content } = req.body;
        
        // Validate content length
        if (!content || content.length < 1 || content.length > 500) {
            return res.status(400).json({ 
                error: 'Post content must be between 1 and 500 characters' 
            });
        }

        // Get user info from session
        const user = req.session.user;
        if (!user) {
            return res.status(401).redirect('/login');
        }

        // Handle anonymous posts
        const isAnonymous = req.body.anonymous === 'true';
        const authorName = isAnonymous ? 'Anonymous' : user.username;
        const authorEmail = isAnonymous ? 'anonymous@example.com' : user.email;
        const authorId = isAnonymous ? null : user._id;

        const newPost = new Post({
            author: authorName,
            authorEmail: authorEmail,
            content: content,
            upvotes: 0,
            downvotes: 0,
            authorId: authorId,
            communityId: req.body.communityId,
            comments: [],
            isAnonymous: isAnonymous
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

        const posts = await Post.find(req.query.communityId ? {communityId: req.query.communityId} : {}).lean().sort(sortOption);

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
// Rate limiting storage
const voteRateLimits = new Map();

exports.votePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { type } = req.body;
        const userId = req.session.user?._id;

        if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

        // Rate limiting check (1 vote per 2 seconds per user)
        const now = Date.now();
        const lastVoteTime = voteRateLimits.get(userId.toString()) || 0;
        if (now - lastVoteTime < 2000) {
            return res.status(429).json({ 
                success: false, 
                message: "You're voting too fast. Please wait 2 seconds between votes." 
            });
        }
        voteRateLimits.set(userId.toString(), now);

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