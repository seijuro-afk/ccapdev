const Comment = require("../models/commentModel");

exports.addComment = async (req, res) => {
    try {
        const { post_id, author, content } = req.body;
        const newComment = new Comment({ post_id, author, content });
        await newComment.save();
        res.status(201).json({ message: "Comment added successfully!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
