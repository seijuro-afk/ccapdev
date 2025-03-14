const Post = require("../models/postModel");

exports.createPost = async (req, res) => {
    try {
        const { content, author } = req.body;
        const newPost = new Post({ content, author });
        await newPost.save();
        res.status(201).json({ message: "Post created successfully!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getPosts = async (req, res) => {
    try {
        const posts = await Post.find().sort({ created_at: -1 }).populate("comments");
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
