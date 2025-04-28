// Theme toggle functionality
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
        });

        // Check for saved theme preference
        if (localStorage.getItem('theme') === 'dark') {
            document.body.classList.add('dark-mode');
        }
    }

    // Form submission handling
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            try {
                // Here you would typically send the data to your backend
                console.log('Form submitted:', data);
                
                // Show success message
                alert('Thank you for your submission!');
                form.reset();
            } catch (error) {
                console.error('Error submitting form:', error);
                alert('There was an error submitting your form. Please try again.');
            }
        });
    });

    // Story card interaction
    const storyCards = document.querySelectorAll('.story-card');
    storyCards.forEach(card => {
        card.addEventListener('click', () => {
            // Here you would typically navigate to the full story view
            console.log('Story card clicked:', card.dataset.storyId);
        });
    });
});
