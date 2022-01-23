const socket = io()
// const converter = new showdown.Converter()
let msgContainer = document.getElementById("message-container")
msgContainer.scrollTop = msgContainer.scrollHeight;
const typingLabel = document.getElementById("typing-label")
const chatTitle = document.getElementById("chat-title")
const entry = document.getElementById("entry")

function getUser() {
    return document.cookie.split(';')[0].split("=")[1]
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

    messageContent.innerHTML = content
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

resize(13)

entry.addEventListener('keyup', (event) => {
    if (event.keyCode == 13 && entry.value != '') {
        let roomId = window.location.href.split('/')[4]
        socket.emit("message", {content: entry.value, roomId: roomId, author: getUser()})
        append(entry.value, document.cookie.split(';')[0].split("=")[1])
        entry.value = ''
        msgContainer.scrollTop = msgContainer.scrollHeight;
    } else {
        setTimeout(() => {
            socket.emit("stop typing")
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

socket.on("typing", (author) => {
    typingLabel.innerHTML = `${author} is typing...`
})

socket.on("stop typing", () => {
    typingLabel.innerHTML = ""
})

socket.on("room change", (name) => {
    chatTitle.value = name
})
