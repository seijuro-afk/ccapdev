const express = require("express");
const { getAllPosts, createPost, votePost } = require("../controllers/postController");

const router = express.Router();
router.get("/", getAllPosts);
router.post("/create", createPost);
router.post("/:id/vote", votePost);

module.exports = router;
