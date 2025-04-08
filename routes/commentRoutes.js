const express = require("express");
const { addComment, getAllComments, getCommentsByPost } = require("../controllers/commentController");

const router = express.Router();
router.post("/add", addComment);
router.get("/:postId", getCommentsByPost); // Updated to include postId parameter

module.exports = router;
