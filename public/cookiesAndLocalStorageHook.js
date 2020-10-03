;(function (e, i) {
    if (typeof define === "function" && define.amd) {
        define([], i)
    } else if (typeof exports === "object") {
        module.exports = i()
    } else {
        e.cookie = i()
    }
})(this, function () {
    const cookie = {}
    cookie.getItem = e
    function e(i) {
        let n = i + "="
        let decodedCookie = decodeURIComponent(document.cookie)
        let ca = decodedCookie.split(";")
        for (var i = 0; i < ca.length; i++) {
            let c = ca[i]
            while (c.charAt(0) == " ") {
                c = c.substring(1)
            }
            if (c.indexOf(n) == 0) {
                return c.substring(n.length, c.length)
            }
        }
        return ""
        this.add = () => {
            console.log(this)
        }
    }
    cookie.setItem = t
    function t(n, i, r) {
        let d = new Date()
        if (r) {
            d.setTime(d.getTime() + r)
        } else {
            d.setTime(d.getTime() + 24 * 60 * 60 * 1000)
        }
        var e = "expires=" + d.toGMTString()
        let k = `${n}=${i};${e};path=/`
        document.cookie = k
    }
    return cookie
})


const A = (function () {
    const PREFIX = ""
    function useCookie(setTo, init) {
        let id = PREFIX + setTo
        let val = init || cookie.getItem(id) || null
        cookie.setItem(id, val)
        let state = () => val
        function setState(newVal) {
            cookie.setItem(id, newVal)
            val = newVal
        }
        return [state, setState]
    }
    function useLocalStorage(setTo, init) {
        let id = PREFIX + setTo
        let val = init || localStorage.getItem(id) || null
        localStorage.setItem(id, val)
        let state = () => val
        function setState(newVal) {
            localStorage.setItem(id, newVal)
            val = newVal
        }
        return [state, setState]
    }
    return { useCookie, useLocalStorage }
})()
