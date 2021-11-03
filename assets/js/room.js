const socket = io()
const converter = new showdown.Converter()
let msgContainer = document.getElementById("message-container")
msgContainer.scrollTop = msgContainer.scrollHeight;

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
    authorDate.innerHTML = `<p>${author}</p> <p>${getDate()}</p>`
    messageDiv.appendChild(authorDate)
    messageDiv.appendChild(messageContent)
    msgContainer.appendChild(messageDiv)
}

window.addEventListener('keyup', (event) => {
    let content = document.getElementById('entry')
    if (event.keyCode == 13 && content.value != '') {
        let roomId = window.location.href.split('/')[4]
        socket.emit("message", {content: content.value, roomId: roomId, author: document.cookie.split(';')[0].split("=")[1]})
        append(content.value, document.cookie.split(';')[0].split("=")[1])
        content.value = ''
        msgContainer.scrollTop = msgContainer.scrollHeight;
    }
})

socket.on("new", (msg) => {
    append(msg.content, msg.author)
    let msgContainer = document.getElementById("message-container")
    msgContainer.scrollTop = msgContainer.scrollHeight;
})