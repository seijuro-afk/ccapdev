document.addEventListener("DOMContentLoaded", function () {
    const posts = [
        { author: "Spongebob Squarepants", content: "This is a sample beep! #BeeLine", timestamp: new Date("2023-10-01") },
        { author: "Patrick Star", content: "This is a sample beep! #BeeLine", timestamp: new Date("2023-10-02") },
        { author: "Squidward", content: "This is a sample beep! #BeeLine", timestamp: new Date("2023-10-03") },
        { author: "Mr. Krabs", content: "This is a sample beep! #BeeLine", timestamp: new Date("2023-10-04") },
        { author: "Plankton", content: "This is a sample beep! #BeeLine", timestamp: new Date("2023-10-05") },
        { author: "Anonymous", content: "This is a sample beep! #BeeLine", timestamp: new Date("2023-10-06") }
    ];

    const postContainer = document.getElementById("postList");
    const sortDropdown = document.getElementById("sortDropdown");

    let isLoggedIn = false; // Change this based on actual authentication status

    // Function to sort posts
    function sortPosts(order) {
        return posts.sort((a, b) => {
            return order === "latest" ? b.timestamp - a.timestamp : a.timestamp - b.timestamp;
        });
    }

    // Function to render posts
    function renderPosts(order = "oldest") {
        postContainer.innerHTML = ""; // Clear posts
        const sortedPosts = sortPosts(order);
        const maxPosts = isLoggedIn ? sortedPosts.length : 5;

        sortedPosts.slice(0, maxPosts).forEach(post => {
            const postElement = `
                <div class="post card mb-3">
                    <div class="card-body d-flex">
                        <img src="../images/spongebob.jpg" class="rounded-circle me-3" alt="Avatar" style="width: 50px; height:50px">
                        <div>
                            <h6 class="card-title mb-1">${post.author}</h6>
                            <p class="card-text">${post.content}</p>
                            <div class="d-flex">
                                <button class="btn btn-sm btn-outline-success me-2 like-btn">
                                    <i class="fa fa-heart"></i> Like
                                </button>
                                <button class="btn btn-sm btn-outline-primary comment-btn">
                                    <i class="fa fa-comment"></i> Comment
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            postContainer.innerHTML += postElement;
        });

        // Disable Like & Comment buttons if not logged in
        if (!isLoggedIn) {
            document.querySelectorAll(".like-btn, .comment-btn").forEach(btn => {
                btn.setAttribute("disabled", "true");
                btn.classList.add("disabled");
            });
        }
    }

    // Initial Render (Default: Oldest to Latest)
    renderPosts();

    // Sorting Event Listener
    sortDropdown.addEventListener("change", function () {
        renderPosts(sortDropdown.value);
    });

    // Authentication Handling
    const authButtonContainer = document.getElementById("authButtonContainer");

    if (!isLoggedIn) {
        authButtonContainer.innerHTML = `<button class="btn btn-outline-light" id="loginButton">Login</button>`;
        document.getElementById("loginButton").addEventListener("click", function () {
            window.location.href = "login.html";
        });

        document.getElementById("postCreation").innerHTML = `<div class="alert alert-warning text-center">Sign in to post.</div>`;
    } else {
        authButtonContainer.innerHTML = `<button class="btn btn-outline-light" id="logoutButton">Logout</button>`;
        document.getElementById("logoutButton").addEventListener("click", function () {
            alert("Logging out...");
            window.location.href = "index.html"; // Redirect after logout
        });
    }
});
