const express = require("express");
const { registerUser, getUserProfile, loginUser } = require("../controllers/userController");

const router = express.Router();

router.post("/signup", registerUser);
router.post("/login", loginUser);
router.get('/user-profile/:userId?', getUserProfile);

module.exports = router;
