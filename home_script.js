document.addEventListener("DOMContentLoaded", function () {
    const isLoggedIn = false; // Change to true if the user is logged in
    const authButtonContainer = document.getElementById("authButtonContainer");
    const posts = document.querySelectorAll(".post");
    
    if (!isLoggedIn) {
        // Show login button
        authButtonContainer.innerHTML = `<button class="btn btn-outline-light" id="loginButton">Login</button>`;
        document.getElementById("loginButton").addEventListener("click", function () {
            window.location.href = "login.html";
        });

        // Disable post creation
        document.getElementById("postCreation").innerHTML = `<div class="alert alert-warning text-center">Sign in to post.</div>`;

        // Limit posts to 5
        posts.forEach((post, index) => {
            if (index >= 5) {
                post.style.display = "none";
            }
        });

        // Disable like and comment buttons
        document.querySelectorAll(".upvote-btn, .downvote-btn").forEach(btn => {
            btn.setAttribute("disabled", "true");
            btn.classList.add("disabled");
            btn.title = "Sign in to vote";
        });
    } else {
        document.querySelectorAll(".upvote-btn, .downvote-btn").forEach(btn => {
            btn.addEventListener("click", function () {
                const postId = this.getAttribute("data-post-id");
                const isUpvote = this.classList.contains("upvote-btn");
                const countSpan = this.querySelector("span");

                // Simulate sending vote to the server
                fetch(`/posts/${postId}/vote`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ type: isUpvote ? "upvote" : "downvote" })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        countSpan.textContent = data.newCount;
                    } else {
                        alert("Error voting");
                    }
                })
                .catch(error => console.error("Error:", error));
            });
        });
        
        // Show logout button
        authButtonContainer.innerHTML = `<button class="btn btn-outline-light" id="logoutButton">Logout</button>`;
        document.getElementById("logoutButton").addEventListener("click", function () {
            alert("Logging out...");
            window.location.href = "index.html"; // Redirect after logout
        });
    }
});
