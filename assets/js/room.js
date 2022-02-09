const socket = io()
let msgContainer = document.getElementById("message-container")
msgContainer.scrollTop = msgContainer.scrollHeight;
const typingLabel = document.getElementById("typing-label")
const chatTitle = document.getElementById("chat-title")
const entry = document.getElementById("entry")

let typing_timer = -1;

function count_down () {
    if (typing_timer === 0) {
        socket.emit("stop typing", getUser());
    }
    if (typing_timer >= 0) {
        typing_timer --;
    }
    setTimeout(count_down, 1000);
}

count_down();

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

function getUsersTyping(author, usersTyping) {
    let authors = ""
    
    if (usersTyping.includes(author)) {
        usersTyping.splice(usersTyping.indexOf(author), 1)
    }

    if (usersTyping.length == 1) {
        authors = `${usersTyping[0]} is typing...`
    } else if (usersTyping.length == 0) {
        authors = ""
    } else {
        authors = usersTyping.join(", ") + " are typing..."
    }
    return authors === "" ? "a" : authors;
}

function append(content, author) {
    let messageDiv = document.createElement("div")
    let messageContent = document.createElement("p")
    let authorDate = document.createElement("div")

    messageDiv.className = "message"
    messageContent.innerText = content
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


entry.addEventListener('keyup', (event) => {
    if (event.keyCode == 13 && entry.value.split(" ").join("") != '') {
        if (entry.value.length > 2000) {
            alert("message content is more than 2000 characters")
            return
        }
        let roomId = window.location.href.split('/')[4]
        socket.emit("message", {content: entry.value, roomId: roomId, author: getUser()})
        append(entry.value, getUser())
        entry.value = ''
        msgContainer.scrollTop = msgContainer.scrollHeight;
        typing_timer = 1;
    } else {
        // setTimeout(() => {
        //     socket.emit("stop typing", getUser())
        // }, 5000)
        typing_timer = 5;
        socket.emit("typing", getUser())
    }
})


document.getElementById("file-upload").addEventListener("click", () => {
    document.getElementById("file-upload-hidden").click()
})

chatTitle.addEventListener("keyup", (event) => {resize(event.keyCode)})

msgContainer.addEventListener("scroll", async () => {
    if (msgContainer.scrollTop == 0) {
        const o = msgContainer.scrollHeight;
        // console.log("sending req now")
        let loaded = document.getElementsByClassName("message").length
        // console.log(loaded)

        let messages = await fetch(`/chats/${roomId}/load`, {
                method: 'POST',
                headers: {'Content-type': 'application/json'},
                body: JSON.stringify({offset: 0, loaded: loaded})
            })
        messages = await messages.text()
        // console.log(`inserting ${messages} into msgContainer div`)
        msgContainer.innerHTML = messages + msgContainer.innerHTML
        msgContainer.scroll({left:0, top:msgContainer.scrollHeight - o, behavior:"instant"});
    }
})

socket.on("new", (msg) => {
    append(msg.content, msg.author)
    let msgContainer = document.getElementById("message-container")
    msgContainer.scrollTop = msgContainer.scrollHeight;
})

socket.on("typing", (authorsTyping) => {
    console.log(`${authorsTyping}`)
    const v = getUsersTyping(getUser(), authorsTyping);
    typingLabel.innerHTML = v;
    typingLabel.className = v === "a" ? "soft-hide" : "";
})

socket.on("stop typing", (usersTyping) => {
    const v = getUsersTyping(getUser(), usersTyping);
    typingLabel.textContent = v;
    typingLabel.className = v === "a" ? "soft-hide" : "";
})

socket.on("room change", (name) => {
    chatTitle.value = name
})

window.onbeforeunload = (e) => {
    socket.emit("stop typing", getUser());
}