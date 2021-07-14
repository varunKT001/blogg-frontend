const serverURL = 'http://localhost:5000'
const siteURL = 'http://localhost:5500'

window.addEventListener('load', async ()=>{
  // CHECK AUTH
  if (localStorage.getItem("token")) {
    const token = localStorage.getItem("token");
    let status = verifySessionStatus(token);
    if(status){
      // GET BLOGS
      let blogs = await getBlogs(token)
      renderBlogs(blogs)
    }
    else{
        location.replace(`${siteURL}/login.html`);
    }
  }
  else{
      location.replace(`${siteURL}/login.html`)
  }
})

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

async function getBlogs(token){
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

function renderBlogs(blogs){
  console.log(blogs)
  let blogsContainer = document.querySelector('.blogs-container')
  let blogCardHTML = ``
  blogs.forEach(blog => {
    blogCardHTML +=`<div class="blog-card">
                      <div class="parent-container">
                      <div class="parent">
                          <div class="div1"><span class="material-icons md-48 orange600">account_circle</span></div>
                          <div class="div2">By: ${blog.author}</div>
                          <div class="div3">Written on: ${blog.date}</div>
                      </div>
                      </div>
                      <div class="blog-tittle"><h3>${blog.tittle}</h3></div>
                      <div class="blog-content">${blog.content}</div>
                    </div>`
  });
  blogsContainer.innerHTML = blogCardHTML
}

function showHome(){
  let home = document.querySelector('.home-container')
  let homeButton = document.querySelector('.home-button')
  let add = document.querySelector('.add-container')
  let addButton = document.querySelector('.add-button')
  
  home.style.display = 'flex'
  homeButton.style["border-bottom"] = '5px solid orange'
  add.style.display = 'none'
  addButton.style["border-bottom"] = 'none'
}

function showAddBlog(){
  let home = document.querySelector('.home-container')
  let homeButton = document.querySelector('.home-button')
  let add = document.querySelector('.add-container')
  let addButton = document.querySelector('.add-button')

  home.style.display = 'none'
  homeButton.style["border-bottom"] = 'none'
  add.style.display = 'flex'
  addButton.style["border-bottom"] = '5px solid orange'
}

async function logout(){
  localStorage.removeItem('token')
  location.replace(`${siteURL}/login.html`)
}
