const Comment = require("../models/commentModel");
const mongoose = require("mongoose");


exports.addComment = async (req, res) => {
    try {
        const { postId, author, content } = req.body;

        if (!postId || !content) {
            console.log("Missing required fields!");
            return res.status(400).json({ error: "All fields are required." });
        }

        const authorName = author && author.trim() != "" ? author : "Anonymous";
        
        const newComment = new Comment({
            postId: new mongoose.Types.ObjectId(postId),
            author: authorName,
            content
        });

        await newComment.save();

        res.redirect("/"); // Refresh homepage after adding a comment
    } catch (error) {
        console.error("Error saving comment:", error);
        res.status(500).json({ error: error.message });
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
