const mongoose = require("mongoose");
const Post = require("../models/postModel");
const Comment = require("../models/commentModel");

exports.createPost = async (req, res) => {
    try {
        const { content } = req.body;
        const newPost = new Post({
            author: "Anonymous",
            content: content,
            avatar: "/images/default-avatar.jpg",
            upvotes: 0,
            downvotes: 0
        });
        await newPost.save();
        res.redirect("/");
    } catch (error) {
        console.error("Error creating post:", error);
        res.status(500).send("Internal Server Error");
    }
};

exports.getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().lean();

        for (let post of posts) {
            post.comments = await Comment.find({ postId: new mongoose.Types.ObjectId(post._id) }).lean();
        }

        res.render("homepage", {
            title: "AnimoBuzz - Home",
            brandName: "AnimoBuzz",
            posts
        });
    } catch (error) {
        console.error("Error fetching posts and comments:", error);
        res.status(500).send("Internal Server Error");
    }
};

// Upvote & Downvote Controller
exports.votePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { type } = req.body; // "upvote" or "downvote"

        const post = await Post.findById(id);
        if (!post) return res.status(404).json({ success: false, message: "Post not found" });

        if (type === "upvote") post.upvotes += 1;
        if (type === "downvote") post.downvotes += 1;

        await post.save();
        res.json({ success: true, upvotes: post.upvotes, downvotes: post.downvotes });
    } catch (error) {
        console.error("Error voting on post:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
