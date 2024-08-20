// this portion seems to be working well

const submitbtn=document.getElementById('su-submit');
submitbtn.disabled=true;

function compare_pwd(id1, id2){
    pwd1=document.getElementById(id1).value;
    pwd2=document.getElementById(id2).value;
    var message=document.getElementById('pwd-message');

    if(pwd1 == pwd2){
        submitbtn.disabled=false;
        message.innerText='Passwords Match'
        message.style.color='green';
    }else{
        submitbtn.disabled=true;
        message.innerText='Passwords do not match'
        message.style.color='red';
    }
}

document.getElementById('password').addEventListener('change', ()=>{
    compare_pwd('password', 'password-confirmation');
});

document.getElementById('password-confirmation').addEventListener('change', ()=>{
    compare_pwd('password', 'password-confirmation');
});

document.getElementById('signup').addEventListener('submit', async (e)=>{
    e.preventDefault();

    const surname= document.getElementById('surname').value;
    const firstname=document.getElementById('firstname').value;
    const tel=document.getElementById('tel').value;
    const email=document.getElementById('email').value;
    const pwd= document.getElementById('password').value;

    const data=[surname, firstname, tel, email, pwd];

    try{
        const response=await fetch('http://localhost:5011/api/signup',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())

        if (response.ok) {
            const result = await response.json();
            if (result.message === 'Signup successful, please login.') {
                // Redirect to the login page
                window.location.href = '/m-login.html';
            } else {
                // Handle any unexpected responses
                console.error('Signup failed:', result.message);
            }
        } else {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    }catch(error){
        console.error('Error:', error);
    }finally {
        // Always reset the form regardless of the outcome
        e.target.reset();
        console.log('Form has been reset');
    }
});

