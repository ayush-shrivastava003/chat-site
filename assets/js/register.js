const username = document.getElementById("username")
const password = document.getElementById("password")
const form = document.getElementById('form')

form.addEventListener('submit', async (event) => {
    event.preventDefault()
    if (username.value != '' && password.value != '') {
        console.log("sent register request");
        let r = await fetch('/account/register', {
            method: 'POST',
            headers: {'Content-type': 'application/json'},
            body: JSON.stringify({
                username: username.value,
                password: password.value
                })
            })
            if (r.status == 200) {
                window.location.href = '/chats'
            } else {
                alert((await r.json()).error)
            }
    }
})