const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    author: { type: String, required: true },
    content: { type: String, required: true },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Comment", CommentSchema);
