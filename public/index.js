function logout() {
    const [token, setToken] = A.useCookie("token")
    setToken("")
    location.href = location.href
}

let tf = false
function handleSettingMenu() {
    let setting_icon = document.querySelector(".setting_icon")
    let list = document.querySelector(".list-nav")
    list.style.display = !tf ? "block" : "none"
    setting_icon.style.transform = !tf ? "rotate(-45deg)" : "rotate(0deg)"
    tf = !tf
}

function handleShare(e) {
    // let ua = new Uint8Array(e.links[0].icon.data)
    // if (navigator.canShare && navigator.canShare({ files: filesArray })) {
    if (navigator.share) {
        navigator
            .share({
                title: e.name,
                text: `This is trace profile of your friend ${e.name}`,
                url: `https://thetrace.in/user/${e.username}`,
            })
            .then(() => console.log("Successful share"))
            .catch((error) => console.log("Error sharing", error))
    } else {
        //do it the old school way
    }
}
