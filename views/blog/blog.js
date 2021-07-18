const serverURL = 'https://blogg-server.herokuapp.com'
const siteURL = 'https://letsblogg.netlify.app'
// const serverURL = 'http://localhost:5000'
// const siteURL = 'http://localhost:5500'

window.addEventListener('load', async () => {
    let blogid = extractParams()
    let blog = await getBlog(blogid)
    if(blog){
        renderBlogs(blog)
    }
    else{
        renderNotFound()
    }
})  

function extractParams() {
    let urlString = window.location.href
    let urlObj = new URL(urlString)
    let blogid = urlObj.searchParams.get('blogid')
    console.log(blogid)
    return blogid
}

function initializeLoader() {
    document.querySelector(".loading-screen").style.display = "flex";
}

function stopLoader() {
    document.querySelector(".loading-screen").style.display = "none";
}

async function getBlog(blogid) {
    let blog = await fetch(`${serverURL}/post/blog/blogid/${blogid}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    blog = await blog.json()
    blog = blog.blogs
    return blog
}

function renderBlogs(blog) {
    console.log(blog)
    let blogsContainer = document.querySelector('.blogs-container')
    let blogCardHTML = ``
    if(blog.length != 0){
    blog = blog[0]
    blogCardHTML += `<div class="blog-card">
                        <div class="parent-container">
                        <div class="parent">
                            <div class="div1"><span class="material-icons md-48 orange600">account_circle</span></div>
                            <div class="div2">By: ${blog.author}</div>
                            <div class="div3">Written on: ${blog.date}</div>
                            <div class="div4"><button class="like-toggle-button" onclick="redirect('login.html')"><span class="material-icons red600 like-icon">favorite_border</span></button><span class="likes-count">${blog.likes}</span></div>
                        </div>
                        </div>
                        <div class="blog-tittle"><h3>${blog.tittle}</h3></div>
                        <div class="blog-description"><em>${blog.description}</em></div>
                        <div class="blog-content">${blog.content}</div>
                        <p><a href="${siteURL}/views/homepage/homepage.html"><- GO BACK TO HOMEPAGE</a></p>
                      </div>`
    }
    else{
        blogCardHTML += `<div class="no-blog-container">
                  <p><h2><strong>404 NOT FOUND !</strong></h2></p>
                  <p><a href="${siteURL}/views/homepage/homepage.html"><- GO BACK TO HOMEPAGE</a></p>
                  </div>`
    }

    blogsContainer.innerHTML = blogCardHTML
    stopLoader()
}

function renderNotFound(){
    let blogsContainer = document.querySelector('.blogs-container')
    let blogCardHTML = `<div class="no-blog-container">
                  <p><h2><strong>404 NOT FOUND !</strong></h2></p>
                  <p><a href="${siteURL}/views/homepage/homepage.html"><- GO BACK TO HOMEPAGE</a></p>
                  </div>`
    blogsContainer.innerHTML = blogCardHTML
    stopLoader()
}

function redirect(path){
    location.replace(`${siteURL}/${path}`)
}