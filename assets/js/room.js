const socket = io()
let msgContainer = document.getElementById("message-container")
msgContainer.scrollTop = msgContainer.scrollHeight;
const typingLabel = document.getElementById("typing-label")
const chatTitle = document.getElementById("chat-title")
const entry = document.getElementById("entry")

function getUser() {
    let data = document.cookie.split(';')[0].split("=")[1]
    return (JSON.parse(decodeURIComponent(data))).username
}

function getDate() {
    let d = new Date()
    let day = d.getDate()
    let month = d.getMonth() + 1
    let year = d.getFullYear()

    return `${month}/${day}/${year}`
}

function append(content, author) {
    let messageDiv = document.createElement("div")
    let messageContent = document.createElement("p")
    let authorDate = document.createElement("div")

    messageDiv.className = "message"
    messageContent.innerHTML = content
    messageContent.className = "content"
    authorDate.className = "author-date"
    authorDate.innerHTML = `<p>${author}</p> <p class="date">${getDate()}</p>`
    messageDiv.appendChild(authorDate)
    messageDiv.appendChild(messageContent)
    msgContainer.appendChild(messageDiv)
}

function resize(keyCode) {
    if (keyCode == 13 && chatTitle.value != '') {
        socket.emit("room change", chatTitle.value, roomId)
    } else {
        chatTitle.style.width = chatTitle.value.length + "ch"
    }
}

// resize(13)

entry.addEventListener('keyup', (event) => {
    if (event.keyCode == 13 && entry.value != '') {
        if (entry.value.length > 2000) {
            alert("message content is more than 2000 characters")
            return
        }
        let roomId = window.location.href.split('/')[4]
        socket.emit("message", {content: entry.value, roomId: roomId, author: getUser()})
        append(entry.value, getUser())
        entry.value = ''
        msgContainer.scrollTop = msgContainer.scrollHeight;
    } else {
        setTimeout(() => {
            socket.emit("stop typing", getUser())
        }, 5000)
        socket.emit("typing", getUser())
    }
})


document.getElementById("file-upload").addEventListener("click", () => {
    document.getElementById("file-upload-hidden").click()
})

chatTitle.addEventListener("keyup", (event) => {resize(event.keyCode)})

socket.on("new", (msg) => {
    append(msg.content, msg.author)
    let msgContainer = document.getElementById("message-container")
    msgContainer.scrollTop = msgContainer.scrollHeight;
})

socket.on("typing", (authorsTyping) => {
    typingLabel.innerHTML = authorsTyping
})

socket.on("stop typing", (usersTyping) => {
    typingLabel.innerHTML = usersTyping
})

socket.on("room change", (name) => {
    chatTitle.value = name
})
