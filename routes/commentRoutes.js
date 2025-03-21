const express = require("express");
const { addComment } = require("../controllers/commentController");

const router = express.Router();
router.post("/add", addComment);

module.exports = router;
