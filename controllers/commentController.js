const Comment = require("../models/commentModel");

const mongoose = require("mongoose");


exports.addComment = async (req, res) => {
    try {

        const { postId, author, content } = req.body;

        if (!postId || !author || !content) {
            console.log("Missing required fields!");
            return res.status(400).json({ error: "All fields are required." });
        }

        const newComment = new Comment({
            postId: new mongoose.Types.ObjectId(postId),
            author,
            content
        });

        await newComment.save();

        res.redirect("/"); // Refresh homepage after adding a comment
    } catch (error) {
        console.error("Error saving comment:", error);
        res.status(500).json({ error: error.message });
    }
};


exports.getAllComments = async (req, res) => {
    try {
        const comments = await Comment.find().lean(); // Fetch all comments
        res.json(comments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
