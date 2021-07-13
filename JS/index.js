const url = "http://localhost:5000";

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
    let response = await fetch(`${url}/auth/verifyToken`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer" + " " + token,
        },
    });
    response = await response.json();
    if ((response.message = "verified")) {
        location.href = "/views/homepage/homepage.html";
    }
}

async function login(user) {
    let response = await fetch(`${url}/auth/login`, {
        method: "POST",
        body: user,
        headers: {
            "Content-Type": "application/json",
        },
    });
    response = await response.json();

    if (response.message == "internal server error") {
        showPopup(response.message + "!, " + "Try again", false);
    } else if (response.message == "user not found") {
        showPopup(response.message, false);
    } else if (response.message == "password incorrect") {
        showPopup(response.message, false);
    } else if (response.message == "user logged in successfully") {
        localStorage.setItem("token", response.token);
        initializeLoader();
        location.href = "/views/homepage/homepage.html";
    }
}

async function register(user) {
    let response = await fetch(`${url}/auth/register`, {
        method: "POST",
        body: user,
        headers: {
            "Content-Type": "application/json",
        },
    });
    response = await response.json();

    if (response.message == "internal server error") {
        showPopup(response.message + "!, " + "Try again");
    } else if (response.message == "user already registered") {
        showPopup(response.message);
    } else if (response.message == "username already exist") {
        showPopup(response.message);
    } else if (response.message == "user successfully registered") {
        localStorage.setItem(
            "success-message",
            response.message + ", " + "Login to continue"
        );
        initializeLoader();
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
