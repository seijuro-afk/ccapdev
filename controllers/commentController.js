const Comment = require("../models/commentModel");
const Post = require("../models/postModel");
const mongoose = require("mongoose");


exports.addComment = async (req, res) => {
    try {
        const { postId, author, content } = req.body;
        // Validate input
        if (!postId || !content) {
            console.log(postId, author, content);
            console.log("Missing required fields!");
            return res.status(400).json({ error: "All fields are required." });
        }

        const authorName = author && author.trim() != "" ? author : "Anonymous";
        
        const newComment = new Comment({
            postId: new mongoose.Types.ObjectId(postId),
            author: authorName,
            content
        });
        
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found." });
        }
        post.comments.push(newComment._id); // Add comment ID to the post's comments array
        await post.save(); // Save the updated post
        await newComment.save();


        res.redirect("/"); // Refresh homepage after adding a comment
    } catch (error) {
        console.error("Error saving comment:", error);
        res.status(500).json({ error: error.message });
    }
};

// Get all comments
exports.getAllComments = async (req, res) => {
    try {
        const comments = await Comment.find().lean();
        res.json(comments);
    } catch (error) {
        console.error("Error fetching comments:", error);
        re
        s.status(500).json({ error: "Internal server error" });
    }
};

exports.getCommentsByPost = async (req, res) => {
    try {
        const postId = req.params.postId;

        const comments = await Comment.find({ postId }).sort({ created_at: -1 }).lean();

        res.json(comments); // You can adjust response for frontend rendering if needed
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
