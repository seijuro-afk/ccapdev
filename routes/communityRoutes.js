const express = require('express');
const { 
    getAllCommunities,
    getCommunity,
    createCommunity
} = require('../controllers/communityController');

const router = express.Router();

// Add middleware to ensure session is available
router.use((req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
});

router.get('/', getAllCommunities);
router.get('/:id', getCommunity);
router.post('/', createCommunity);

module.exports = router;
