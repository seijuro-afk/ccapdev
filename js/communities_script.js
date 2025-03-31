const discussions = [
    {
        title: "Discussion 1",
        content: "This is the content for discussion 1.",
        timestamp: new Date("2023-10-01")
    },
    {
        title: "Discussion 2",
        content: "This is the content for discussion 2.",
        timestamp: new Date("2023-10-02")
    }
];

// Function to sort discussions from oldest to latest
function sortDiscussions() {
    return discussions.sort((a, b) => a.timestamp - b.timestamp);
}

// Function to render discussions
function renderDiscussions() {
    const sortedDiscussions = sortDiscussions();
    const discussionList = document.getElementById("discussion-list");
    discussionList.innerHTML = ""; // Clear existing discussions

    sortedDiscussions.forEach(discussion => {
        const discussionElement = `
            <li><a href="discussionthread.html">${discussion.title}</a></li>
        `;
        discussionList.innerHTML += discussionElement;
    });
}

document.addEventListener("DOMContentLoaded", function() {
    renderDiscussions(); // Initial render of discussions

    // Existing tab switching functionality
    const tabs = document.querySelectorAll(".tab");
    const contents = document.querySelectorAll(".tab-content");
    
    tabs.forEach(tab => {
        tab.addEventListener("click", function() {
            const target = this.getAttribute("data-tab");
            contents.forEach(content => content.classList.remove("active"));
            document.getElementById(target).classList.add("active");
        });
    });
    
    // Join/Leave community button toggle
    const joinLeaveBtn = document.getElementById("join-leave-btn");
    if (joinLeaveBtn) {
        joinLeaveBtn.addEventListener("click", function() {
            if (this.textContent === "Join") {
                this.textContent = "Leave";
                this.style.backgroundColor = "#D9B8B9";
            } else {
                this.textContent = "Join";
                this.style.backgroundColor = "";
            }
        });
    }
    
    // Upvote/Downvote functionality
    document.querySelectorAll(".upvote, .downvote").forEach(button => {
        button.addEventListener("click", function() {
            alert(`${this.textContent} clicked!`);
        });
    });
    
    // Report button alert
    document.querySelectorAll(".report").forEach(button => {
        button.addEventListener("click", function() {
            alert("Reported this post.");
        });
    });
});
