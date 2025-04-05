const Community = require('../models/communityModel');

exports.getAllCommunities = async (req, res) => {
    try {
        const communities = await Community.find().populate('creator', 'username');
        res.render('communities', {
            title: 'Communities',
            communities,
            user: req.session.user
        });
    } catch (error) {
        console.error('Error fetching communities:', error);
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

        res.render('community-details', {
            title: community.name,
            community,
            user: req.session.user
        });
    } catch (error) {
        console.error('Error fetching community:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.createCommunity = async (req, res) => {
    try {
        const { name, description } = req.body;
        const user = req.session.user;

        if (!user) {
            return res.status(401).redirect('/login');
        }

        const newCommunity = new Community({
            name,
            description,
            creator: user._id,
            members: [user._id]
        });

        await newCommunity.save();
        res.redirect('/communities');
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Community name already exists' });
        }
        console.error('Error creating community:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.joinCommunity = async (req, res) => {
    try {
        const community = await Community.findById(req.params.id);
        const user = req.session.user;

        if (!community || !user) {
            return res.status(404).json({ error: 'Not found' });
        }

        if (!community.members.includes(user._id)) {
            community.members.push(user._id);
            await community.save();
        }

        res.json({ success: true });
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
