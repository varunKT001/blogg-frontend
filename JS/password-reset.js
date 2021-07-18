const serverURL = 'https://blogg-server.herokuapp.com'
const siteURL = 'https://letsblogg.netlify.app'
// const serverURL = 'http://localhost:5000'
// const siteURL = 'http://localhost:5500'

let submitLoginButton = document.getElementById('submit-login')
let notification = document.getElementById('notification')
let notificationText = document.getElementById('notification-text')
let notificationClose = document.querySelector('.close-button')

function initializeLoader() {
    document.querySelector('.loading-screen').style.display = 'flex'
}

function stopLoader() {
    document.querySelector('.loading-screen').style.display = 'none'
}

function showPopup(message, success) {
    if (success) {
        notification.style.border = '2px solid green'
        notification.style.background = 'rgba(0, 255, 0, 0.05)'
    }
    else {
        notification.style.border = '2px solid red'
        notification.style.background = 'rgba(255, 0, 0, 0.05)'
    }

    notification.style.display = 'flex'
    notificationText.innerText = message
}

function closePopup() {
    notification.style.display = 'none'
    notificationText.innerText = ''
}

function validate(user) {
    if (!user.password) {
        return {
            val: false,
            message: "Enter all the required fields",
        };
    }
    if (user.password != user.confirmPassword) {
        return {
            val: false,
            message: "Passwords don't match",
        };
    }
    return {
        val: true
    };
}

async function resetPassword(user) {
    initializeLoader()
    console.log(emailtoken)
    let response = await fetch(`${serverURL}/auth/reset-password`, {
        method: 'POST',
        body: user,
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer' + ' ' + emailtoken
        }
    })
    response = await response.json()

    if (response.message == 'internal server error') {
        stopLoader()
        showPopup(response.message + '!, ' + 'Try again', false)
    }
    else if (response.message == 'token expired') {
        stopLoader()
        showPopup(response.message, false)
    }
    else if (response.message == 'jwt malformed') {
        stopLoader()
        showPopup(response.message, false)
    }
    else if (response.message == 'invalid token') {
        stopLoader()
        showPopup(response.message, false)
    }
    else if (response.message == 'password reset successfully') {
        localStorage.setItem(
            "success-message",
            response.message + ", " + "Login to continue"
        );
        location.href = "/login.html";
    }
}

submitLoginButton.addEventListener('click', (event) => {
    let password = document.getElementById('password').value
    let confirmPassword = document.getElementById('confirm-password').value
    let user = {
        password,
        confirmPassword
    }
    let success = validate(user)
    if (success.val) {
        console.log(user);
        user = JSON.stringify(user);
        resetPassword(user);
    }   
    else {
        showPopup(success.message, false)
    }
})

notificationClose.addEventListener('click', closePopup)
