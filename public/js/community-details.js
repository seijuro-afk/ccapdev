document.addEventListener('DOMContentLoaded', () => {
    // Join/Leave Community
    const joinLeaveBtn = document.getElementById('join-leave-btn');
    if (joinLeaveBtn) {
        joinLeaveBtn.addEventListener('click', async () => {
            const communityId = window.location.pathname.split('/').pop();
            const action = joinLeaveBtn.textContent.includes('Join') ? 'join' : 'leave';
            
            try {
                const res = await fetch(`/communities/${communityId}/${action}`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    credentials: 'include'
                });

                if (res.ok) {
                    window.location.reload(); // Refresh to update UI
                } else {
                    const err = await res.json();
                    alert(`Error: ${err.message || 'Failed to update membership'}`);
                }
            } catch (err) {
                console.error('Community action error:', err);
                alert('Network error - please try again');
            }
        });
    }

    // Additional community detail page functionality can be added here
});
