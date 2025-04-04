const express = require("express");
const { addComment, getAllComments } = require("../controllers/commentController");

const router = express.Router();
router.post("/add", addComment);
router.get("/", getAllComments);

module.exports = router;
