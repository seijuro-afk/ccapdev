const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
    content: { type: String, required: true },
    author: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }]
});

module.exports = mongoose.model("Post", PostSchema);