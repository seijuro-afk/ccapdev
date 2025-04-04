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
        console.error('Error creating community:', error);
        res.status(500).send('Internal Server Error');
    }
};
