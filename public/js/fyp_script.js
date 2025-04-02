// Followed topics storage with duplicate prevention
let followedTopics = new Set(['Campus Life', 'Food & Dining']);

// Update followed topics section dynamically
function updateFollowedTopics() {
    const followedTopicsSection = document.getElementById('followedTopics');
    if (!followedTopicsSection) {
        console.error('Followed topics section not found');
        return;
    }
    followedTopicsSection.innerHTML = '';
    followedTopics.forEach(topic => {
        const topicDiv = document.createElement('div');
        topicDiv.className = 'topic-item';
        topicDiv.innerHTML = `
            <span class="topic-name">${topic}</span>
            <button class="unfollow-btn" data-topic="${topic}">Unfollow</button>
        `;
        followedTopicsSection.appendChild(topicDiv);
    });
}

// Update personalized feed based on followed topics
function updatePersonalizedFeed() {
    const feed = document.getElementById('personalizedFeed');
    if (!feed) {
        console.error('Personalized feed section not found');
        return;
    }
    feed.innerHTML = '';

    if (followedTopics.size > 0) {
        followedTopics.forEach(topic => {
            const feedItem = document.createElement('div');
            feedItem.className = 'feed-item';
            feedItem.innerHTML = `
                <h3 class="feed-title">"${topic} tips for freshmen?"</h3>
                <p class="feed-details">By @${topic.toLowerCase().replace(/\s+/g, '')} | 12 upvotes</p>
            `;
            feed.appendChild(feedItem);
        });
    } else {
        feed.innerHTML = `
            <div class="empty-feed">
                <p>Follow some topics to see personalized content!</p>
            </div>
        `;
    }
}

// Initialize the page after DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add null checks for all main sections
    const mainSections = [
        'followedTopics',
        'personalizedFeed',
        'recommendedTopics'
    ];
    
    mainSections.forEach(sectionId => {
        if (!document.getElementById(sectionId)) {
            console.error(`Section with ID ${sectionId} not found`);
        }
    });

    updateFollowedTopics();
    updatePersonalizedFeed();
    
    // Add event listeners for follow/unfollow buttons
    document.querySelectorAll('.follow-btn').forEach(button => {
        button.addEventListener('click', handleFollowClick);
    });
    
    document.body.addEventListener('click', handleUnfollowClick);
});

function handleFollowClick(event) {
    const topic = event.target.getAttribute('data-topic');
    if (!followedTopics.has(topic)) {
        followedTopics.add(topic);
        updateFollowedTopics();
        updatePersonalizedFeed();
        event.target.textContent = 'Unfollow';
        event.target.classList.remove('follow-btn');
        event.target.classList.add('unfollow-btn');
    } else {
        alert(`You're already following ${topic}`);
    }
}

function handleUnfollowClick(event) {
    if (event.target.classList.contains('unfollow-btn')) {
        const topic = event.target.getAttribute('data-topic');
        if (followedTopics.delete(topic)) {
            event.target.closest('.topic-item').remove();
            updatePersonalizedFeed();
        }
    }
}
