let cards = document.querySelectorAll(".wrap")
const [token, setToken] = A.useCookie("token")

cards.forEach((card) => {
    card.onclick = function () {
        this.querySelector(".type").focus()
    }
})

let form = document.querySelector("form")

form.onsubmit = function (e) {
    e.preventDefault()
    console.log("oka")
    let formData = []
    formData.push({ token: token() })

    cards.forEach((card) => {
        let type = card.querySelector(".icon").classList[1]
        let data = card.querySelector(".type")
        let visibility = card.querySelector(".checkbox")
        let d = {}
        d.key = type
        d.value = data.value
        d.visibility = visibility.checked
        formData.push(d)
    })
    fetch("/postUserData", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        redirect: "follow",
        body: JSON.stringify(formData),
    })
        .then((res) => res.json())
        .then((e) => {
            location.href = e.url
        })
}
