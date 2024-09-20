document.getElementById('signup').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent form from submitting the default way

    const surname = document.getElementById('surname').value;
    const firstname = document.getElementById('firstname').value;
    const tel = document.getElementById('tel').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirmation = document.getElementById('password-confirmation').value;

    // Ensure password and confirmation match
    if (password !== passwordConfirmation) {
        document.getElementById('pwd-message').innerText = 'Passwords do not match';
        return;
    }

    try {
        const response = await fetch('/api/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ surname, firstname, tel, email, pwd: password })
        });

        if (response.ok) {
            alert('Signup successful, please login.');
            window.location.href = '/m-login.html'; // Redirect to the login page on successful signup
        } else {
            const data = await response.json();
            alert(data.message || 'Signup failed. Please try again.');
        }
    } catch (error) {
        console.error('Error occurred:', error);
        alert('Error occurred during signup. Please try again.');
    }
});

