document.addEventListener('DOMContentLoaded', () => {
    // Handle form submission for creating communities
    const createForm = document.querySelector('#create-community-form');
    if (createForm) {
        createForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(createForm);
            const data = {
                name: formData.get('name'),
                description: formData.get('description')
            };

            try {
                const response = await fetch('/communities', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    window.location.reload();
                } else {
                    const error = await response.json();
                    alert(error.error || 'Failed to create community');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred while creating the community');
            }
        });
    }

    // Handle post voting
    document.querySelectorAll('.upvote, .downvote').forEach(button => {
        button.addEventListener('click', async (e) => {
            const postId = e.target.dataset.postId;
            const voteType = e.target.classList.contains('upvote') ? 'upvote' : 'downvote';
            const feedbackEl = e.target.closest('.post-actions').querySelector('.vote-feedback');

            try {
                const response = await fetch(`/posts/${postId}/vote`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ type: voteType })
                });

                if (response.ok) {
                    const result = await response.json();
                    // Update vote counts
                    const upvoteCount = e.target.closest('.post-actions').querySelector('.upvote-count');
                    const downvoteCount = e.target.closest('.post-actions').querySelector('.downvote-count');
                    
                    if (upvoteCount) upvoteCount.textContent = result.upvotes;
                    if (downvoteCount) downvoteCount.textContent = result.downvotes;
                    
                    // Show feedback
                    if (feedbackEl) {
                        feedbackEl.textContent = 'Vote recorded!';
                        setTimeout(() => feedbackEl.textContent = '', 2000);
                    }
                } else {
                    const error = await response.json();
                    if (feedbackEl) feedbackEl.textContent = error.error || 'Vote failed';
                }
            } catch (error) {
                console.error('Error:', error);
                if (feedbackEl) feedbackEl.textContent = 'Error submitting vote';
            }
        });
    });

    // Handle comment submission
    const commentForm = document.querySelector('#comment-form');
    if (commentForm) {
        commentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const content = commentForm.querySelector('textarea').value;
            const postId = commentForm.dataset.postId;
            const feedbackEl = commentForm.querySelector('.comment-feedback');

            try {
                const response = await fetch(`/posts/${postId}/comments`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ content })
                });

                if (response.ok) {
                    window.location.reload(); // Refresh to show new comment
                } else {
                    const error = await response.json();
                    if (feedbackEl) feedbackEl.textContent = error.error || 'Comment failed';
                }
            } catch (error) {
                console.error('Error:', error);
                if (feedbackEl) feedbackEl.textContent = 'Error submitting comment';
            }
        });
    }

    // Handle join/leave community buttons
    const joinLeaveBtn = document.getElementById('join-leave-btn');
    if (joinLeaveBtn) {
        joinLeaveBtn.addEventListener('click', async () => {
            const communityId = window.location.pathname.split('/').pop();
            const isMember = joinLeaveBtn.textContent === 'Leave';

            try {
                const response = await fetch(`/communities/${communityId}/${isMember ? 'leave' : 'join'}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    joinLeaveBtn.textContent = isMember ? 'Join' : 'Leave';
                    // Update member count if needed
                    const memberCount = document.getElementById('member-count');
                    if (memberCount) {
                        const currentCount = parseInt(memberCount.textContent);
                        memberCount.textContent = `${isMember ? currentCount - 1 : currentCount + 1} members`;
                    }
                } else {
                    const error = await response.json();
                    alert(error.error || 'Operation failed');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred');
            }
        });
    }
});
