// script.js - JavaScript for Community and Discussion Pages

document.addEventListener("DOMContentLoaded", function() {
    // Tab switching functionality
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
