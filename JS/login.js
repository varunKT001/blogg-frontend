let submitLoginButton = document.getElementById('submit-login')
let notification = document.getElementById('notification')
let notificationText = document.getElementById('notification-text')
let notificationClose = document.querySelector('.close-button')

function initializeLoader(){
    document.querySelector('.loading-screen').style.display = 'flex'
}

function stopLoader(){
    document.querySelector('.loading-screen').style.display = 'none'
}

function showPopup(message, success){
    if(success){
        notification.style.border = '2px solid green'
        notification.style.background = 'rgba(0, 255, 0, 0.05)'
    }
    else{
        notification.style.border = '2px solid red'
        notification.style.background = 'rgba(255, 0, 0, 0.05)'
    }

    notification.style.display = 'flex'
    notificationText.innerText = message
}

function closePopup(){
    notification.style.display = 'none'
    notificationText.innerText = ''
}

function validate(user) {
  if (!user.email || !user.password) {
    return {
      val: false,  
      message: "Enter all the required fields",
    };
  }
  return {
      val: true
  };
}

async function verifySessionStatus(token) {
    let response = await fetch(`${serverURL}/auth/verifyToken`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer" + " " + token,
        },
    });
    response = await response.json();
    if ((response.message = "verified")) {
        return true;
    } else {
        return false;
    }
}

async function login(user){
    let response = await fetch(`${serverURL}/auth/login`, {
        method: 'POST',
        body: user,
        headers: {
            'Content-Type': 'application/json'
        }
    })
    response = await response.json()

    if(response.message == 'internal server error'){
        showPopup(response.message + '!, ' + 'Try again', false)
    }
    else if(response.message == 'user not found'){
        showPopup(response.message, false)
    }
    else if(response.message == 'password incorrect'){
        showPopup(response.message, false)
    }
    else if(response.message == 'user logged in successfully'){
        localStorage.setItem('token', response.token)
        initializeLoader()
        location.href = '/views/homepage/homepage.html'
    }
}

window.addEventListener('load', ()=>{
    if(localStorage.getItem('success-message')){
        showPopup(localStorage.getItem('success-message'), true)
    }
    localStorage.removeItem('success-message')
})

submitLoginButton.addEventListener('click', (event)=>{
    let email = document.getElementById('email').value
    let password = document.getElementById('password').value
    let user = {
        email,
        password
    }
    let success = validate(user)
    if(success.val){
        console.log(user);
        user = JSON.stringify(user);
        login(user);
    }
    else{
        showPopup(success.message, false)
    }
})

notificationClose.addEventListener('click', closePopup)
