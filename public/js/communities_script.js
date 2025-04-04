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
                    alert('Failed to create community');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred while creating the community');
            }
        });
    }
});
