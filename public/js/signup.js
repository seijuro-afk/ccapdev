// validate-password.js

// This function will run after the webpage is fully loaded
window.onload = function() {
    // Get the form and the input fields
    var form = document.querySelector('form');
    var passwordInput = document.querySelector('input[name="password"]');
    var confirmPasswordInput = document.querySelector('input[name="confirm_password"]');
    var messageContainer = document.createElement('div');
    messageContainer.style.color = 'red';
    form.appendChild(messageContainer);

    // Add an event listener to the form submit event
    form.onsubmit = function(event) {
        // Clear previous messages
        messageContainer.innerHTML = '';
        var errors = [];

        // Get the values of the password inputs
        var password = passwordInput.value;

        // Check if password contains at least one number
        if (!/\d/.test(password)) {
            errors.push('Password must contain at least one number.');
        }

        // Check if password contains at least one capital letter
        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one capital letter.');
        }

        // Check if password is longer than 8 characters
        if (password.length <= 8) {
            errors.push('Password must be longer than 8 characters.');
        }

        // Check if passwords match
        if (password !== confirmPasswordInput.value) {
            errors.push('Passwords do not match.');
        }

        // If there are errors, prevent form submission and show messages
        if (errors.length > 0) {
            event.preventDefault();
            messageContainer.innerHTML = errors.join('<br>');
        }
    };
};
