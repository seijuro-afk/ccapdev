const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    content: { type: String, required: true },
    author: { type: String, required: true },
    authorEmail: { type: String, required: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    communityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Community' },
    avatar: { type: String, default: "/images/spongebob.jpg" },
    isAnonymous: { type: Boolean, default: false },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    voters: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        voteType: { type: String, enum: ['upvote', 'downvote'] }
    }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);