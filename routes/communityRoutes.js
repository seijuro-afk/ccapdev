const express = require('express');
const {
    getAllCommunities,
    getCommunity,
    createCommunity,
    updateCommunity,
    joinCommunity,
    leaveCommunity,
    getDiscussionThread,
    deleteCommunity
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
router.get('/:id/discussionthread/:postId', getDiscussionThread);
router.post('/', createCommunity);
router.post('/:id/join', joinCommunity);
router.post('/:id/leave', leaveCommunity);
router.put('/:id', updateCommunity);
router.delete('/:id', deleteCommunity);

module.exports = router;
