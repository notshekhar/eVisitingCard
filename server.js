const express = require("express")
const ejs = require("ejs")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const logger = require("morgan")

const {
    login,
    signup,
    getUserData,
    auth,
    getProfileData,
    getProfileDataForEdit,
    postUserData,
    middleware
} = require("./serverJS/database")

const fs = require("fs")
var https = require("https")
const { get } = require("http")
let privateKey = fs.readFileSync("https/localhost.key")
let certificate = fs.readFileSync("https/localhost.cert")
const credentials = { key: privateKey, cert: certificate }

const origin = process.env.ORIGIN

require("dotenv").config()

const app = express()
const httpsServer = https.createServer(credentials, app)


app.use(logger("dev"))
app.set("view engine", "ejs")
app.use(middleware)
app.use(
    cors({
        origin: origin,
        credentials: true,
    })
)
app.use(express.json(), express.urlencoded({ extended: false }), cookieParser())
app.use(express.static("public"))

const server = app.listen(process.env.PORT || 3000, () => {
    console.log(`listening on port ${process.env.PORT || 3000}`)
})

httpsServer.listen(3001, () => {
    console.log("secure connection on 3001 port")
})

const capitalize = (s) => {
    if (typeof s !== "string") return ""
    return s.charAt(0).toUpperCase() + s.slice(1)
}

app.get("/", (req, res) => {
    let { token } = req.cookies
    if (!token) token = ""
    if (token.length > 0) {
        getUserData(token, (e) => {
            if (e.get) {
                res.render("index", {
                    loggedin: true,
                    name: `${capitalize(e.fname)} ${capitalize(e.lname)}`,
                })
            } else {
                res.render("index", { loggedin: false })
            }
        })
    } else {
        res.render("index", { loggedin: false })
    }
})
app.get("/login", (req, res) => {
    let { token } = req.cookies
    if (!token) token = ""
    if (token.length > 0) {
        getUserData(token, (e) => {
            if (e.get) {
                res.render("index", {
                    loggedin: true,
                    name: `${capitalize(e.fname)} ${capitalize(e.lname)}`,
                })
            } else {
                res.render("index", { loggedin: false })
            }
        })
    } else {
        res.render("index", { loggedin: false })
    }
})

app.post("/login", (req, res) => {
    const { username, password } = req.body
    login({ username, password }, (e) => {
        if (e.login) {
            res.cookie("token", e.token)
            res.redirect(`/user/${e.username}`)
        } else {
            res.redirect("/login")
        }
    })
    // res.redirect(`/user/${username}`)
})
app.post("/signup", (req, res) => {
    const { fname, lname, email, password, conf_password } = req.body
    signup({ fname, lname, email, password, conf_password }, (e) => {
        console.log(e)
        if (e.signup) {
            res.cookie("token", e.token)
            res.redirect(`/user/${e.username}`)
        } else {
            res.redirect("/signup")
        }
    })
})
app.get("/signup", (req, res) => {
    let { token } = req.cookies
    if (!token) token = ""
    if (token.length > 0) {
        getUserData(token, (e) => {
            if (e.get) {
                res.render("signup", {
                    loggedin: true,
                    name: `${capitalize(e.fname)} ${capitalize(e.lname)}`,
                })
            } else {
                res.render("signup", { loggedin: false })
            }
        })
    } else {
        res.render("signup", { loggedin: false })
    }
})
app.get("/user/myaccount", (req, res) => {
    let { token } = req.cookies
    if (!token) token = ""
    //get all data of this username and sow it on profile page
    if (token.length > 0) {
        auth(token, (e) => {
            if (e.auth) {
                getProfileDataForEdit(e.username, (data) => {
                    res.render("editprofile", { auth: true, data, capitalize })
                })
            } else {
                res.redirect("/")
            }
        })
    } else {
        res.redirect("/")
    }
})

app.get("/user/:id", (req, res) => {
    const { id } = req.params
    let { token } = req.cookies
    if (!token) token = ""
    //get all data of this username and sow it on profile page
    getProfileData(id, (data) => {
        if (token.length > 0) {
            auth(token, (e) => {
                if (e.auth & (e.username == id)) {
                    res.render("profile", { id, auth: true, data, capitalize })
                } else {
                    res.render("profile", { id, auth: false, data, capitalize })
                }
            })
        } else {
            res.render("profile", { id, auth: false, data, capitalize })
        }
    })
})

app.post("/postUserData", (req, res) => {
    let data = req.body
    let token = data[0].token
    if (!token) token = ""
    data.splice(0, 1)
    if (token.length > 0) {
        auth(token, (e) => {
            if (e.auth) {
                postUserData(data, e.username, (r) => {
                    if (r.posted) {
                        res.json({ url: `/user/${e.username}` })
                        // res.redirect(`/user/${e.username}`)
                    } else {
                        res.json({ url: "/user/myaccount" })
                        // res.redirect("/user/myaccount")
                    }
                })
            } else {
                res.json({ url: "/" })
                // res.redirect("/")
            }
        })
    } else {
        res.json({ url: "/" })
        // res.redirect("/")
    }
})
