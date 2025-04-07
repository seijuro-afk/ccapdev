const Community = require('../models/communityModel');
const Post = require('../models/postModel');
const { ObjectId } = require('mongoose').Types;

exports.getAllCommunities = async (req, res) => {
    try {
        console.log('Session user:', req.session.user);
        const communities = await Community.find().populate('creator', 'username');
        console.log('Fetched communities:', communities);
        res.render('communities.hbs', {
            title: 'Communities',
            communities,
            user: req.session.user,
            brandName: 'Community Hub', // Add brand name
            showNavbar: true // Ensure navbar is shown
        });
    } catch (error) {
        console.error('Error fetching communities:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getDiscussionThread = async (req, res) => {
    try {
        const { id, postId } = req.params;
        
        if (!ObjectId.isValid(postId)) {
            return res.status(400).send('[Invalid post ID]');
        }

        const post = await Post.findById(postId)
            .populate('authorId', 'username pfp_url')
            .lean();

        if (!post) {
            return res.status(404).send('Post not found');
        }

        res.render('discussionthread', {
            discussion: {
                _id: post._id,
                title: post.content.substring(0, 50),
                author: post.authorId?.username || 'Unknown',
                authorAvatar: post.authorId?.pfp_url || '/images/default-avatar.jpg',
                content: post.content,
                upvotes: post.upvotes || 0,
                downvotes: post.downvotes || 0,
                replies: [] // Will be populated later
            },
            relatedDiscussions: []
        });
    } catch (error) {
        console.error('Error getting discussion thread:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getCommunity = async (req, res) => {
    try {
        const community = await Community.findById(req.params.id)
            .populate('creator', 'username')
            .populate('members', 'username');

        if (!community) {
            return res.status(404).send('Community not found');
        }

        const user = req.session.user;
        const isMember = community.members.some(member =>
            member._id.toString() === user._id.toString()
        );

        const joinButtonText = isMember ? 'Leave Community' : 'Join Community';

        res.render('community-details', {
            title: community.name,
            name: community.name,
            description: community.description,
            joinButtonText,
            tabs: [
                { id: 'discussions', label: 'Discussions' },
                { id: 'events', label: 'Events' },
                { id: 'members', label: 'Members' }
            ],
            activeTab: {
                discussions: true, // default tab
                events: false,
                members: false
            },
            discussions: [], // To be filled with real posts if implemented
            members: community.members.map(m => m.username),
            events: [], // Optional for now
            user,
            community
        });
    } catch (error) {
        console.error('Error loading community details:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.createCommunity = async (req, res) => {
    try {
        const { name, description } = req.body;
        const user = req.session.user;

        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (!name || !description) {
            return res.status(400).json({ error: 'Name and description are required' });
        }

        const newCommunity = new Community({
            name,
            description,
            creator: user._id,
            members: [user._id]
        });

        await newCommunity.save();
        res.status(201).json({ 
            success: true,
            community: newCommunity
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Community name already exists' });
        }
        console.error('Error creating community:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.updateCommunity = async (req, res) => {
    try {
        const { name, description } = req.body;
        const user = req.session.user;
        const community = await Community.findById(req.params.id);

        if (!community || !user) {
            return res.status(404).json({ error: 'Not found' });
        }

        if (community.creator.toString() !== user._id.toString()) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        community.name = name || community.name;
        community.description = description || community.description;
        await community.save();

        res.json({ 
            success: true,
            community
        });
    } catch (error) {
        console.error('Error updating community:', error);
        res.status(500).json({ error: 'Server Error' });
    }
};

exports.joinCommunity = async (req, res) => {
    try {
        const community = await Community.findById(req.params.id);
        const user = req.session.user;

        if (!community || !user) {
            return res.status(404).json({ error: 'Community or user not found' });
        }

        const isMember = community.members.some(member => 
            member.toString() === user._id.toString()
        );

        if (!isMember) {
            community.members.push(user._id);
            await community.save();
        }

        res.json({ 
            success: true,
            action: 'join',
            memberCount: community.members.length
        });
    } catch (error) {
        console.error('Error joining community:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.leaveCommunity = async (req, res) => {
    try {
        const community = await Community.findById(req.params.id);
        const user = req.session.user;

        if (!community || !user) {
            return res.status(404).json({ error: 'Not found' });
        }

        community.members = community.members.filter(member => 
            member.toString() !== user._id.toString()
        );
        await community.save();

        res.json({ success: true });
    } catch (error) {
        console.error('Error leaving community:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.deleteCommunity = async (req, res) => {
    try {
        const community = await Community.findById(req.params.id);
        const user = req.session.user;

        if (!community || !user) {
            return res.status(404).json({ error: 'Not found' });
        }

        // Only creator can delete
        if (community.creator.toString() !== user._id.toString()) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        await Community.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting community:', error);
        res.status(500).json({ error: 'Server Error' });
    }
};
