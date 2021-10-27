const username = document.getElementById("username")
const password = document.getElementById("password")
const form = document.getElementById('form')

form.addEventListener('submit', async (event) => {
    event.preventDefault()
    let r = await fetch('/account/login', {
    method: 'POST',
    headers: {'Content-type': 'application/json'},
    body: JSON.stringify({
        username: username.value,
        password: password.value
        })
    })

    console.log(r.status)
}
)