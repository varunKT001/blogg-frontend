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
    if (!user.email) {
        return {
            val: false,
            message: "Enter all the required fields",
        };
    }
    return {
        val: true
    };
}

async function sendResetLink(user) {
    initializeLoader()
    let response = await fetch(`${serverURL}/auth/send-reset`, {
        method: 'POST',
        body: user,
        headers: {
            'Content-Type': 'application/json'
        }
    })
    response = await response.json()

    if (response.message == 'internal server error') {
        stopLoader()
        showPopup(response.message + '!, ' + 'Try again', false)
    }
    else if (response.message == 'user not found') {
        stopLoader()
        showPopup(response.message, false)
    }
    else if (response.message == 'something went wrong') {
        stopLoader()
        showPopup(response.message, false)
    }
    else if (response.message == 'password reset link send') {
        stopLoader()
        showPopup(response.message + ' (CHECK SPAM FOLDER)', true)
    }
}

submitLoginButton.addEventListener('click', (event) => {
    let email = document.getElementById('email').value
    let user = {
        email
    }
    let success = validate(user)
    if (success.val) {
        console.log(user);
        user = JSON.stringify(user);
        sendResetLink(user);
    }
    else {
        showPopup(success.message, false)
    }
})

notificationClose.addEventListener('click', closePopup)
