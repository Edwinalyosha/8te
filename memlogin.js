document.getElementById('login').addEventListener('submit', async (e)=>{
    e.preventDefault();

    const email=document.getElementById('email').value;
    const pwd=document.getElementById('password').value;

    const data={email, pwd};

    console.log('sending ', email, pwd);
    try {
        const response = await fetch('http://localhost:5011/api/signin', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        const responseData = await response.json();

        if (response.ok) {
            // Check if redirect URL is provided
            if (responseData.redirectUrl) {
                //this is where i try to redirect from the front end, tried this so many different ways so im no longer so sure if im doing it right
                window.location.href = responseData.redirectUrl;
            } else {
                console.error('Unexpected response:', responseData);
            }
        } else {
            console.error('Login failed:', responseData.message || response.statusText);
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        e.target.reset();
        console.log('Form has been reset');
    }
});