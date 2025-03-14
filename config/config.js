require('dotenv').config();

module.exports = {
    mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/forumDB',
    port: process.env.PORT || 5000
};
