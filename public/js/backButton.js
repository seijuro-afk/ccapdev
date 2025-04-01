// Function to go back to the previous page
function goBack() {
    window.history.back();
}

// Add event listener to all elements with the class "back-button"
document.querySelectorAll(".back-button").forEach(button => {
    button.addEventListener("click", goBack);
});