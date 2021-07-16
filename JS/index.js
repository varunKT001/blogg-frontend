let submitRegisterButton = document.getElementById("submit-register");
let notification = document.getElementById("notification");
let notificationText = document.getElementById("notification-text");
let notificationClose = document.querySelector(".close-button");

function initializeLoader() {
    document.querySelector(".loading-screen").style.display = "flex";
}

function stopLoader() {
    document.querySelector(".loading-screen").style.display = "none";
}

function showPopup(message, success) {
    if (success) {
        notification.style.border = "2px solid green";
        notification.style.background = "rgba(0, 255, 0, 0.05)";
    } else {
        notification.style.border = "2px solid red";
        notification.style.background = "rgba(255, 0, 0, 0.05)";
    }

    notificationText.innerText = message;
    notification.style.display = "flex";
}

function closePopup() {
    notificationText.innerText = "";
    notification.style.display = "none";
}

function validate(user) {
    if (!user.name || !user.username || !user.email || !user.password) {
        return {
            val: false,
            message: "Enter all the required fields",
        };
    }
    if (user.password.length < 8) {
        return {
            val: false,
            message: "Password must be of atleast 8 characters long",
        };
    }
    if (!/\d/.test(user.password)) {
        return {
            val: false,
            message: "Password must contain a number",
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

async function register(user) {
    initializeLoader()
    let response = await fetch(`${serverURL}/auth/register`, {
        method: "POST",
        body: user,
        headers: {
            "Content-Type": "application/json",
        },
    });
    response = await response.json();

    if (response.message == "internal server error") {
        stopLoader()
        showPopup(response.message + "!, " + "Try again");
    } else if (response.message == "user already registered") {
        stopLoader()
        showPopup(response.message);
    } else if (response.message == "username already exist") {
        stopLoader()
        showPopup(response.message);
    } else if (response.message == "user successfully registered") {
        localStorage.setItem(
            "success-message",
            response.message + ", " + "Login to continue"
        );
        location.href = "/login.html";
    }
}

submitRegisterButton.addEventListener("click", (event) => {
    let name = document.getElementById("name").value;
    let username = document.getElementById("username").value;
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;
    let user = {
        name,
        username,
        email,
        password,
    };
    let success = validate(user);
    if (success.val) {
        user = JSON.stringify(user);
        register(user);
    } else {
        showPopup(success.message, false);
    }
});

notificationClose.addEventListener("click", closePopup);
