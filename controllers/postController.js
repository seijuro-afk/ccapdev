const mongoose = require("mongoose");
const Post = require("../models/postModel");
const Comment = require("../models/commentModel");

exports.createPost = async (req, res) => {
    try {
        const { content } = req.body;
        const newPost = new Post({
            author: "Anonymous", 
            content: content,
            avatar: "/images/default-avatar.jpg"
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


