// memlogin.js

// document.getElementById('login').addEventListener('submit', async function(event) {
//     event.preventDefault(); // Prevent form from submitting the default way

//     const email = document.getElementById('email').value;
//     const password = document.getElementById('password').value;

//     try {
//         const response = await fetch('/api/signin', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ email, pwd: password })
//         });

//         const data = await response.json();

//         if (response.ok) {
//             // Successful login
//             window.location.href = data.redirectUrl; // Redirect to member page
//         } else {
//             // Show error message
//             alert(data.message || 'Login failed. Please try again.');
//         }
//     } catch (error) {
//         alert('Error occurred during login. Please try again.');
//     }
// });

document.getElementById('login').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent form from submitting the default way

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    console.log(JSON.stringify({ email, pwd: password }));

    try {
        const response = await fetch('http://localhost:5011/api/signin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, pwd: password }),
            credentials: 'include'
        });

        
        const data = await response.json();

        if (response.ok) {
            // Successful login, proceed to redirect
            if (data.redirectUrl) {
                window.location.href = data.redirectUrl; // Redirect to member page
            } else {
                console.error('No redirect URL provided in response');
                alert('Login successful, but no redirect URL found. Please try again.');
            }
        } else {
            // Show error message from server response
            alert(data.message || 'Login failed. Please try again.');
        }
    } catch (error) {
        console.error('Error occurred during login:', error);
        alert('Error occurred during login. Please try again.');
    }
});


// document.getElementById('login').addEventListener('submit', async (event) => {
//     event.preventDefault(); // Prevent the form from submitting the traditional way

//     const email = document.getElementById('email').value;
//     const password = document.getElementById('password').value;

//     try {
//         const response = await fetch('http://localhost:5011/api/signin', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             credentials: 'include', // Include cookies with the request
//             body: JSON.stringify({ email, pwd: password })
//         });

//         const result = await response.json();
//         if (response.ok) {
//             window.location.href = result.redirectUrl; // Redirect on successful login
//         } else {
//             alert(result.message); // Show error message
//         }
//     } catch (error) {
//         console.error('Error:', error);
//         alert('An error occurred while logging in.');
//     }
// });
