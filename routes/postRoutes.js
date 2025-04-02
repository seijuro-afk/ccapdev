const express = require("express");
const { getAllPosts, createPost, votePost } = require("../controllers/postController");

const router = express.Router();

// Add middleware to ensure session is available
router.use((req, res, next) => {
    if (!req.session.user && req.path !== '/') {
        return res.redirect('/login');
    }
    next();
});

router.get("/", getAllPosts);
router.post("/create", createPost);
router.post("/:id/vote", votePost);

module.exports = router;