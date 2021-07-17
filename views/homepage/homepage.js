const serverURL = 'https://blogg-server.herokuapp.com'
const siteURL = 'https://letsblogg.netlify.app'
// const serverURL = 'http://localhost:5000'
// const siteURL = 'http://localhost:5500'

let notification = document.getElementById("notification");
let notificationText = document.getElementById("notification-text");

window.addEventListener('load', async () => {
  // CHECK AUTH
  initializeLoader()
  if (localStorage.getItem("token")) {
    const token = localStorage.getItem("token");
    let status = await verifySessionStatus(token);
    if (status.val) {
      // GET BLOGS
      let blogs = await getBlogs(token)
      let userBlogs = await getUserBlogs(token, status.user)
      renderBlogs(blogs, status.user)
      renderProfile(status.user, userBlogs)
      stopLoader()
    }
    else {
      localStorage.removeItem('token')
      location.replace(`${siteURL}/login.html`);
    }
  }
  else {
    localStorage.removeItem('token')
    location.replace(`${siteURL}/login.html`)
  }
})

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

async function verifySessionStatus(token) {
  let response = await fetch(`${serverURL}/auth/verifyToken`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer" + " " + token,
    },
  });
  response = await response.json();
  if (response.message == "verified") {
    return {
      val: true,
      user: response.user
    };
  } else {
    return {
      val: false
    };
  }
}

async function sendVerificationLink(){
  initializeLoader()
  let token = localStorage.getItem('token')
  let status = await verifySessionStatus(token)
  if (status.val){
    let user = status.user
    console.log(user)
    user = JSON.stringify(user)
    let response = await fetch(`${serverURL}/auth/verify-email`,{
      method: 'POST',
      body: user,
      headers: {
        'Content-Type': 'application/json'
      }
    })
    response = await response.json()
    stopLoader()
    console.log(response)
    showAddBlog()
    showPopup(response.message + ' (CHECK SPAM FOLDER)', (response.errcode?false:true))
  }
  else {
    location.replace(`${siteURL}/login.html`)
  }
}

async function getBlogs(token) {
  let blogs = await fetch(`${serverURL}/post/blogs`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer' + ' ' + token
    }
  })
  blogs = await blogs.json()
  blogs = blogs.blogs
  return blogs
}

async function getUserBlogs(token, user) {
  let blogs = await fetch(`${serverURL}/post/blogs/${user.username}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer' + ' ' + token
    }
  })
  blogs = await blogs.json()
  blogs = blogs.blogs
  return blogs
}

async function likeToggle(userid, blogid, i){
  let token = localStorage.getItem('token')
  let body = {
    userid: userid,
    blogid: blogid
  }
  body = JSON.stringify(body)
  let response = await fetch(`${serverURL}/post/blog/like`, {
    method: 'POST',
    body: body,
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer' + ' ' + token
    }
  })
  response = await response.json()
  if(response.message == "liked"){
    console.log(response.message, blogid)
    let likeButton = document.getElementsByClassName('like-icon')[i]
    let likeCount = document.getElementsByClassName('likes-count')[i]
    likeCount.innerText = parseInt(likeCount.innerText) + 1
    likeButton.innerText = 'favorite'
  }
  else if(response.message == "undo liked"){
    console.log(response.message, blogid)
    let likeButton = document.getElementsByClassName('like-icon')[i]
    let likeCount = document.getElementsByClassName('likes-count')[i]
    likeCount.innerText = parseInt(likeCount.innerText) - 1
    likeButton.innerText = 'favorite_border'
  }
  else{
    //do nothing
    console.log(response.message, blogid)
  }
}

async function likedOrNot(userid, blogid){
  let relationship = await fetch(`${serverURL}/post/blog/likedOrNot?userid=${userid}&blogid=${blogid}`)
  relationship = await relationship.json()
  console.log(relationship.message)
  return relationship.message
}

async function renderBlogs(blogs, user) {
  console.log(blogs)
  let blogsContainer = document.querySelector('.blogs-container')
  let blogCardHTML = ``
  if(blogs.length != 0){
    for(let i=0; i<blogs.length;i++){
      blog = blogs[i]
      let relationship = await likedOrNot(user.id, blog.blogid)
      likeButton = relationship?'favorite':'favorite_border'
      blogCardHTML += `<div class="blog-card">
                        <div class="parent-container">
                        <div class="parent">
                            <div class="div1"><span class="material-icons md-48 orange600">account_circle</span></div>
                            <div class="div2">By: ${blog.author}</div>
                            <div class="div3">Written on: ${blog.date}</div>
                            <div class="div4"><button class="like-toggle-button" onclick="likeToggle(${user.id}, ${blog.blogid}, ${i})"><span class="material-icons red600 like-icon">${likeButton}</span></button><span class="likes-count">${blog.likes}</span></div>
                        </div>
                        </div>
                        <div class="blog-tittle"><h3>${blog.tittle}</h3></div>
                        <div class="blog-description"><em>${blog.description}</em></div>
                        <div class="blog-content">${blog.content}</div>
                        <button class = "read-more" onclick="expandContent(${i})">READ MORE</button>
                        <button class = "read-less" onclick="hideContent(${i})">READ LESS</button>
                      </div>`
    }
  }
  else{
    blogCardHTML =`<div class="no-blog-container">
                  <p><h2>No Blogs at the moment! why don't you write one?</h2></p>
                  <p> Click on the <span class="material-icons">add_box</span> icon, on the navigation bar to get started!</p>
                  </div>`
  }
  blogsContainer.innerHTML = blogCardHTML
}

function renderProfile(user, userBlogs){
  console.log(user)
  let profileContainer = document.querySelector('.profile-container')
  verification = (user.verified == 'true')?'VERIFIED':'VERIFY'
  verificationFunction = (user.verified == 'true') ? '' : 'sendVerificationLink()'
  profileData =` <h2>Profile</h2>
                <div class="add-blog">
                    <div><strong>USER-NAME</strong>: ${user.username}</div>
                    <div><strong>NAME</strong>: ${user.name}</div>
                    <div><strong>E-MAIL</strong>: ${user.email} <button class="verify-button" onclick=${verificationFunction}>${verification}</button></div>
                </div>`
  let blogCardHTML = ``
  if (userBlogs.length != 0) {
    userBlogs.forEach(blog => {
      blogCardHTML += `<div class="blog-card">
                        <div class="parent-container">
                        <div class="parent">
                            <div class="div1"><span class="material-icons md-48 orange600">account_circle</span></div>
                            <div class="div2">By: ${blog.author}</div>
                            <div class="div3">Written on: ${blog.date}</div>
                            <div class="div4"><button class="like-toggle-button"><span class="material-icons red600 like-icon">favorite</span></button><span class="likes-count">${blog.likes}</span></div>
                        </div>
                        </div>
                        <div class="blog-tittle"><h3>${blog.tittle}</h3></div>
                        <div class="blog-description"><em>${blog.description}</em></div>
                        <div class="blog-content-profile">${blog.content}</div>
                        <button class="delete-blog-button" onclick="deleteUserBlog(${blog.blogid})">DELETE BLOG</button>
                      </div>`
    });
  }
  else {
    blogCardHTML = `<div class="no-blog-container">
                  <p><h2>No Blogs at the moment! why don't you write one?</h2></p>
                  <p> Click on the <span class="material-icons">add_box</span> icon, on the navigation bar to get started!</p>
                  </div>`
  }
  profileContainer.innerHTML = `<div class="blogs-container">` + profileData + blogCardHTML + `</div>`
  let verifyButton = document.querySelector('.verify-button')
  verifyButton.style.background = (user.verified == 'true') ? 'green' : 'red'

}

async function deleteUserBlog(blogid){
  initializeLoader()
  let token = localStorage.getItem('token')
  let response = await fetch(`${serverURL}/post/blog/${blogid}`,{
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer' + ' ' + token
    }
  })
  response = await response.json();
  if (response.message == 'blog deleted successfully'){
    location.replace(`${siteURL}/views/homepage/homepage.html`)
  }
  else{
    stopLoader()
    showAddBlog()
    showPopup(response.message, false)
  }
}

function showHome() {
  let home = document.querySelector('.home-container')
  let homeButton = document.querySelector('.home-button')
  let add = document.querySelector('.add-container')
  let addButton = document.querySelector('.add-button')
  let profile = document.querySelector('.profile-container')
  let profileButton = document.querySelector('.profile-button')

  home.style.display = 'flex'
  homeButton.style["border-bottom"] = '5px solid orange'
  add.style.display = 'none'
  addButton.style["border-bottom"] = 'none'
  profile.style.display = 'none'
  profileButton.style["border-bottom"] = 'none'
}

function showAddBlog() {
  let home = document.querySelector('.home-container')
  let homeButton = document.querySelector('.home-button')
  let add = document.querySelector('.add-container')
  let addButton = document.querySelector('.add-button')
  let profile = document.querySelector('.profile-container')
  let profileButton = document.querySelector('.profile-button')

  home.style.display = 'none'
  homeButton.style["border-bottom"] = 'none'
  add.style.display = 'flex'
  addButton.style["border-bottom"] = '5px solid orange'
  profile.style.display = 'none'
  profileButton.style["border-bottom"] = 'none'
}

function showProfile() {
  let home = document.querySelector('.home-container')
  let homeButton = document.querySelector('.home-button')
  let add = document.querySelector('.add-container')
  let addButton = document.querySelector('.add-button')
  let profile = document.querySelector('.profile-container')
  let profileButton = document.querySelector('.profile-button')

  home.style.display = 'none'
  homeButton.style["border-bottom"] = 'none'
  add.style.display = 'none'
  addButton.style["border-bottom"] = 'none'
  profile.style.display = 'flex'
  profileButton.style["border-bottom"] = '5px solid orange'
}

function hideContent(i){
  let content = document.getElementsByClassName('blog-content')[i]
  let readmoreButton = document.getElementsByClassName('read-more')[i]
  let readlessButton = document.getElementsByClassName('read-less')[i]
  console.log(content, i)
  readmoreButton.style.display = 'inline-block'
  readlessButton.style.display = 'none'
  content.style.display = 'none'
}
function expandContent(i){
  let content = document.getElementsByClassName('blog-content')[i]
  let readmoreButton = document.getElementsByClassName('read-more')[i]
  let readlessButton = document.getElementsByClassName('read-less')[i]
  console.log(content, i)
  readmoreButton.style.display = 'none'
  readlessButton.style.display = 'inline-block'
  content.style.display = 'block'
}


function validate(blog){
  if (!blog.tittle || !blog.content || !blog.description){
    return {
      val: false,
      message: 'Enter the required fields!'
    }
  }
  else{
    return {
      val: true,
    }
  }
}

function checkUserEmailVerified(user){
  if (user.verified == 'false'){
    return false
  }
  return true
}

async function submitBlog() {
  initializeLoader()
  let token = localStorage.getItem('token')
  let tittle = document.querySelector('.tittle').value
  let content = document.querySelector('.content').value
  let description = document.querySelector('.description').value
  let { user } = await verifySessionStatus(token)

  if (!checkUserEmailVerified(user)) {
    stopLoader()
    return showPopup('Please verify you E-mail first. Click on profile icon ⬆️', false)
  }

  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();
  today = mm + '/' + dd + '/' + yyyy

  let blog = {
    tittle: tittle,
    author: user.username,
    date: today,
    content: content,
    description: description
  }

  let success = validate(blog)
  if(!success.val){
    stopLoader()
    return showPopup(success.message, success.val)
  }

  let response = await fetch(`${serverURL}/post/blog`, {
    method: 'POST',
    body: JSON.stringify(blog),
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer' + ' ' + token
    }
  })

  response = await response.json()
  stopLoader()
  if(response.message == 'internal server error'){
    showPopup(response.message, false)
  }
  else{
    showPopup(response.message + ' (PLEASE RELOAD)', true)
  }
}

async function logout() {
  initializeLoader()
  localStorage.removeItem('token')
  location.replace(`${siteURL}/login.html`)
}
