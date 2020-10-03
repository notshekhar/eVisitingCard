const mysql = require("mysql")
const { promisify } = require("util")
const { MD5, encodeJSON, decodeJSON } = require("./encryption")

const mysql_config = {
    host: "localhost", 
    user: "root",
    password: "", 
    database: "", 
}

const pool = mysql.createConnection(mysql_config)
const query = promisify(pool.query).bind(pool)
const end = promisify(pool.end).bind(pool)

// const pool = mysql.createConnection(mysql_config)

function login(data, cb) {
    const { username, password } = data
    pool.query(
        "Select username, password from users where username=? or email=? and password=?",
        [username, username, MD5(password)],
        (error, res) => {
            if (error) {
                cb({
                    login: false,
                    message: "Internal Error",
                })
            } else {
                if (res.length > 0) {
                    cb({
                        login: true,
                        username: res[0].username,
                        token: encodeJSON({
                            username: res[0].username,
                            password: res[0].password,
                        }),
                    })
                } else {
                    cb({
                        login: false,
                        message: "User don't exist check password or username",
                    })
                }
            }
        }
    )
}
// login({username: "notshekhar@gmail.com", password: "shekhar2303"}, e=>console.log(e))
// function createDetails(id, args) {
//     query("select uid, username, from users where username=?", [id]).then((e) => {
//         let res = e[0]
//         args.forEach((arg) => {
//             query(
//                 "insert into users_links values(NULL, ?, ?, ?, '', 'true', CURRENTDATE())",
//                 [uid, username, arg]
//             )
//         })
//     })
// }
// createDetails("shekharfsdf", ["snapchat", "facebook"])

function signup(data, cb) {
    console.log("okay")
    const { fname, lname, email, password, conf_password } = data
    if (password == conf_password) {
        let username = fname.toLocaleLowerCase() + lname.toLocaleLowerCase()
        let pass_code = MD5(password)
        pool.query(
            "select username from users where fname = ? and lname = ?",
            [fname, lname],
            (err, usernames) => {
                if (err) {
                    cb({ signup: false, message: "Internal error 1", err })
                } else {
                    let length = usernames.length
                    username += !length ? "" : length
                    pool.query(
                        "select * from users where email=?",
                        [email],
                        (err, results) => {
                            if (err) {
                                cb({
                                    signup: false,
                                    message: "Internal error 2",
                                    err,
                                })
                            } else {
                                if (results.length > 0) {
                                    cb({
                                        signup: false,
                                        message: "User already exist",
                                    })
                                } else {
                                    pool.query(
                                        "insert into users (fname, lname, password, email, username) values(?, ?, ?, ?, ?)",
                                        [
                                            fname.toLocaleLowerCase(),
                                            lname.toLocaleLowerCase(),
                                            pass_code,
                                            email,
                                            username,
                                        ],
                                        (err, res) => {
                                            if (err) {
                                                cb({
                                                    signup: false,
                                                    message: "Internal error 3",
                                                    err,
                                                })
                                            } else {
                                                // createDetails(username, ["facebook", "snapchat", "email"])
                                                console.log("done")
                                                cb({
                                                    signup: true,
                                                    username,
                                                    token: encodeJSON({
                                                        username,
                                                        password: pass_code,
                                                    }),
                                                })
                                            }
                                        }
                                    )
                                }
                            }
                        }
                    )
                }
            }
        )
    } else {
        cb({ signup: false, message: "Re-Enter Password" })
    }
}
function auth(token, cb) {
    const { username, password } = decodeJSON(token)
    pool.query(
        "select username from users where username=? and password=?",
        [username, password],
        (err, res) => {
            if (err) {
                cb({ auth: false, message: "Internal error" })
            } else {
                if (res.length > 0) {
                    cb({ auth: true, username: res[0].username })
                } else {
                    cb({ get: false })
                }
            }
        }
    )
}

function getUserData(token, cb) {
    const { username, password } = decodeJSON(token)
    pool.query(
        "select fname, lname from users where username=? and password=?",
        [username, password],
        (err, res) => {
            if (err) {
                cb({ get: false })
            } else {
                if (res.length > 0) {
                    cb({ get: true, fname: res[0].fname, lname: res[0].lname })
                } else {
                    cb({ get: false })
                }
            }
        }
    )
}
const capitalize = (s) => {
    if (typeof s !== "string") return ""
    return s.charAt(0).toUpperCase() + s.slice(1)
}
function getProfileData(id, cb) {
    let data = {}
    query("select uid, fname, lname, username from users where username=?", [
        id,
    ])
        .then((e) => {
            let res = e[0]
            if (res) {
                data = {
                    name: `${capitalize(res.fname)} ${capitalize(res.lname)}`,
                    username: res.username,
                }
                query(
                    "select * from users_links where uid=? and visibility='true' and link != ''",
                    [res.uid]
                )
                    .then((links) => {
                        //card details
                        query("select * from card_details")
                            .then((d) => {
                                // data.links = links.map((el) => {
                                //     for (let i = 0; i < d.length; i++) {
                                //         if (el.type == d[i].type) {
                                //             let ret = { ...el, ...d[i] }
                                //             d.splice(i, 1)
                                //             return ret
                                //         }
                                //     }
                                // })
                                data.links = d
                                    .map((el) => {
                                        for (let i = 0; i < links.length; i++) {
                                            if (el.type == links[i].type) {
                                                let ret = { ...el, ...links[i] }
                                                links.splice(i, 1)
                                                return ret
                                            }
                                        }
                                    })
                                    .filter((e) => (e ? true : false))
                                console.log(data.links)
                                cb({ get: true, data })
                            })
                            .catch((err) => {
                                data.links = []
                                cb({ get: true, data })
                            })
                    })
                    .catch((err) => {
                        data.links = []
                        cb({ get: true, data })
                    })
            } else {
                data = false
                cb({ get: true, data })
            }
        })
        .catch((e) => {
            cb({ get: false, message: "Internal error" })
        })
}
function getProfileDataForEdit(id, cb) {
    let data = {}
    query("select username, fname, lname, email from users where username=?", [
        id,
    ])
        .then((e) => {
            data = {
                name: `${capitalize(e[0].fname)} ${capitalize(e[0].lname)}`,
                username: e[0].username,
            }
            query("select * from card_details")
                .then((e) => {
                    query(
                        "select * from users_links where type in (select type from card_details) and username=?",
                        [id]
                    )
                        .then((res) => {
                            data.details = e.map((el) => {
                                for (let i = 0; i < res.length; i++) {
                                    if (el.type == res[i].type) {
                                        let ret = { ...el, ...res[i] }
                                        res.splice(i, 1)
                                        return ret
                                    }
                                }
                                return el
                            })
                            cb({ get: true, data })
                        })
                        .catch((err) =>
                            cb({ get: false, message: "Internal error 2" })
                        )
                })
                .catch((err) => cb({ get: false, message: "Internal error 3" }))
        })
        .catch((err) => cb({ get: false, message: "Internal error 1" }))
}

function postUserData(data, username, cb) {
    for (let input of data) {
        insertORupdate(
            username,
            input.key,
            input.value,
            JSON.stringify(input.visibility),
            (e) => {
                console.log(e)
                cb(e)
            }
        )
    }
}
function insertORupdate(username, key, val, vis, cb) {
    query("select uid from users where username=?", [username])
        .then((res) => {
            let uid = res[0].uid
            query(`select * from users_links where username=? and type=?`, [
                username,
                key,
            ]).then((e) => {
                let dataFound = e[0]
                if (dataFound) {
                    if (dataFound.link != val || dataFound.visibility != vis) {
                        query(
                            "update users_links set link=?, visibility=? where username=? and type=?",
                            [val, vis, username, key]
                        )
                            .then((r) => {
                                cb({
                                    posted: true,
                                })
                            })
                            .catch((err) => {
                                cb({
                                    posted: false,
                                    message: "Error updating",
                                })
                            })
                    }
                } else {
                    query(
                        "insert into users_links(uid, username, type, link, visibility) values(?, ?, ?, ?, ?)",
                        [uid, username, key, val, vis]
                    )
                        .then((r) => {
                            cb({
                                posted: true,
                            })
                        })
                        .catch((err) => {
                            cb({
                                posted: false,
                                message: "Error inserting new value",
                            })
                        })
                }
            })
        })
        .catch((err) =>
            cb({
                posted: false,
                message: "Internal Error",
            })
        )
}
function middleware(req, res, next) {
    if (req) save(req)
    if (res) save(res)
    next()
}
function save(json) {
    // let objJsonStr = JSON.stringify(json)
    // let base64 = Buffer.from(objJsonStr).toString("base64")
    console.log(json)
}

module.exports = {
    login,
    signup,
    getUserData,
    auth,
    getProfileData,
    getProfileDataForEdit,
    postUserData,
    middleware,
}
