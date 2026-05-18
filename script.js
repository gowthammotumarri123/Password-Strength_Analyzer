document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('toggle-password');
    const strengthBar = document.getElementById('strength-bar');
    const strengthLabel = document.getElementById('strength-label');
    const feedbackList = document.getElementById('feedback-list');
    const suggestionsList = document.getElementById('suggestions-list');
    const saveBtn = document.getElementById('save-btn');
    const saveMessage = document.getElementById('save-message');
    const form = document.getElementById('password-form');
    
    // Toggle password visibility
    togglePasswordBtn.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // Update icon based on state
        if (type === 'text') {
            togglePasswordBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>';
        } else {
            togglePasswordBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
        }
    });

    let typingTimer;
    const doneTypingInterval = 300; // ms

    // Listen for password input
    passwordInput.addEventListener('input', () => {
        clearTimeout(typingTimer);
        const password = passwordInput.value;
        
        if (password.length === 0) {
            resetUI();
            return;
        }

        typingTimer = setTimeout(() => {
            analyzePassword(password);
        }, doneTypingInterval);
    });

    async function analyzePassword(password) {
        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password })
            });
            
            const data = await response.json();
            updateUI(data);
        } catch (error) {
            console.error("Error analyzing password:", error);
        }
    }

    function resetUI() {
        strengthBar.style.width = '0%';
        strengthBar.style.backgroundColor = 'transparent';
        strengthLabel.textContent = 'Strength: None';
        feedbackList.innerHTML = '';
        suggestionsList.innerHTML = '';
        saveBtn.disabled = true;
    }

    function updateUI(data) {
        const { score, label, feedback, suggestions } = data;
        
        // Update progress bar
        const colors = [
            'transparent',
            'var(--strength-1)',
            'var(--strength-2)',
            'var(--strength-3)',
            'var(--strength-4)',
            'var(--strength-5)'
        ];
        
        strengthBar.style.width = `${(score / 5) * 100}%`;
        strengthBar.style.backgroundColor = colors[score];
        
        // Update label
        strengthLabel.textContent = `Strength: ${label}`;
        strengthLabel.style.color = score > 0 ? colors[score] : 'var(--text-secondary)';
        
        // Enable/disable save button (require at least Fair strength)
        saveBtn.disabled = score < 3;
        
        // Update feedback
        feedbackList.innerHTML = '';
        if (feedback && feedback.length > 0) {
            feedback.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                feedbackList.appendChild(li);
            });
        }
        
        // Update suggestions
        suggestionsList.innerHTML = '';
        if (suggestions && suggestions.length > 0) {
            suggestions.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                suggestionsList.appendChild(li);
            });
        }
    }

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = passwordInput.value;
        
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';
        saveMessage.textContent = '';
        saveMessage.className = 'message';
        
        try {
            const response = await fetch('/api/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                saveMessage.textContent = data.message;
                saveMessage.classList.add('success');
                // Optional: clear form
                // form.reset();
                // resetUI();
            } else {
                saveMessage.textContent = data.message || 'An error occurred';
                saveMessage.classList.add('error');
            }
        } catch (error) {
            saveMessage.textContent = 'Network error. Please try again.';
            saveMessage.classList.add('error');
        } finally {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Save Password';
        }
    });
});
