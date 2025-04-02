const express = require("express");
const { registerUser, getUserProfile, loginUser } = require("../controllers/userController");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/:username", getUserProfile);

module.exports = router;
