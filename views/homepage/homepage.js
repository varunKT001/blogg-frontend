const serverURL = 'http://localhost:5000'
const siteURL = 'http://localhost:5500'

if (localStorage.getItem("token")) {
  const token = localStorage.getItem("token");
  let status = verifySessionStatus(token);
  if(status){
      
  }
  else{
      location.replace(`${siteURL}/login.html`);
  }
}
else{
    location.replace(`${siteURL}/login.html`)
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
