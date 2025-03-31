document.addEventListener("DOMContentLoaded", function () {
    const posts = [
        {
            author: "Spongebob Squarepants",
            content: "This is a sample beep! #BeeLine",
            timestamp: new Date("2023-10-01")
        },
        {
            author: "Patrick Star",
            content: "This is a sample beep! #BeeLine",
            timestamp: new Date("2023-10-02")
        },
        {
            author: "Squidward",
            content: "This is a sample beep! #BeeLine",
            timestamp: new Date("2023-10-03")
        },
        {
            author: "Mr. Krabs",
            content: "This is a sample beep! #BeeLine",
            timestamp: new Date("2023-10-04")
        },
        {
            author: "Plankton",
            content: "This is a sample beep! #BeeLine",
            timestamp: new Date("2023-10-05")
        },
        {
            author: "Anonymous",
            content: "This is a sample beep! #BeeLine",
            timestamp: new Date("2023-10-06")
        }
    ];

    // Function to sort posts from oldest to latest
    function sortPosts() {
        return posts.sort((a, b) => a.timestamp - b.timestamp);
    }

    // Function to render posts
    function renderPosts() {
        const sortedPosts = sortPosts();
        const postContainer = document.querySelector(".col-md-6");
        postContainer.innerHTML = ""; // Clear existing posts

        sortedPosts.forEach(post => {
            const postElement = `
                <div class="post card mb-3">
                    <div class="card-body d-flex">
                        <img src="../images/spongebob.jpg" class="rounded-circle me-3" alt="Avatar" style="width: 50px; height:50px">
                        <div>
                            <h6 class="card-title mb-1">${post.author}</h6>
                            <p class="card-text">${post.content}</p>
                            <div class="d-flex">
                                <button class="btn btn-sm btn-outline-success me-2">
                                    <i class="fa fa-heart"></i> Like
                                </button>
                                <button class="btn btn-sm btn-outline-primary">
                                    <i class="fa fa-comment"></i> Comment
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            postContainer.innerHTML += postElement;
        });
    }

    renderPosts(); // Initial render of posts

    const isLoggedIn = false; // Change to true if the user is logged in
    const authButtonContainer = document.getElementById("authButtonContainer");
    
    if (!isLoggedIn) {
        // Show login button
        authButtonContainer.innerHTML = `<button class="btn btn-outline-light" id="loginButton">Login</button>`;
        document.getElementById("loginButton").addEventListener("click", function () {
            window.location.href = "login.html";
        });

        // Disable post creation
        document.getElementById("postCreation").innerHTML = `<div class="alert alert-warning text-center">Sign in to post.</div>`;

        // Limit posts to 5
        const postsElements = document.querySelectorAll(".post");
        postsElements.forEach((post, index) => {
            if (index >= 5) {
                post.style.display = "none";
            }
        });

        // Disable like and comment buttons
        document.querySelectorAll(".like-btn, .comment-btn").forEach(btn => {
            btn.setAttribute("disabled", "true");
            btn.classList.add("disabled");
        });
    } else {
        // Show logout button
        authButtonContainer.innerHTML = `<button class="btn btn-outline-light" id="logoutButton">Logout</button>`;
        document.getElementById("logoutButton").addEventListener("click", function () {
            alert("Logging out...");
            window.location.href = "index.html"; // Redirect after logout
        });
    }
});
