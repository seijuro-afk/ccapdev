document.addEventListener("DOMContentLoaded", () => {
    // Initialize tab functionality
    const tabs = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    // Handle tab switching
    const switchTab = (tabName) => {
        // Remove active class from all tabs and contents
        tabs.forEach(tab => tab.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        // Add active class to selected tab and content
        const selectedTab = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
        const selectedContent = document.getElementById(`${tabName}-tab`);
        if (selectedTab && selectedContent) {
            selectedTab.classList.add('active');
            selectedContent.classList.add('active');
        }
    };

    // Add click event listeners to tabs
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            switchTab(tabName);
        });
    });

    // Set default tab to posts
    switchTab('posts');


    // Handle profile edit button click
    const editProfileBtn = document.querySelector('button[onclick="editProfile()"]');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', () => {
            // Add profile editing functionality here
            console.log('Edit profile clicked');
        });
    }


});
