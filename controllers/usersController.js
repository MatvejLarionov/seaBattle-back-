const usersData = require("../data/usersData")

const isCorrectPassword = (password) => {
    if (password.length < 8)
        return false
    if (!password.split("").find(item =>
        item.charCodeAt(0) < "0".charCodeAt(0) ||
        item.charCodeAt(0) > "9".charCodeAt(0)))
        return false
    return true
}
const usersController = {
    registration(req, res) {
        req.body.login = req.body.login.trim()
        req.body.password = req.body.password.trim()
        const user = req.body
        if (!user.login || !user.password) {
            res.json({ error: "emptyFields" })
            return
        }
        if (usersData.isLoginRepeat(user.login)) {
            res.json({ error: "loginRepeat" })
            return
        }
        if (!isCorrectPassword(user.password)) {
            res.json({ error: "passwordIsNotCorrect" })
            return
        }
        const newUser = usersData.create(user)
        delete newUser.password
        res.json(newUser)
    },
    authorization(req, res) {
        req.body.login = req.body.login.trim()
        req.body.password = req.body.password.trim()
        const resObj = {
        }
        const user = usersData.read({ login: req.body.login, password: req.body.password })[0]
        if (!user) {
            resObj.error = 'notFound'
        }
        else {
            resObj.user = user
            delete resObj.user.password
        }
        res.json(resObj)
    },
    getUser(req, res) {
        const id = req.params.id
        const user = usersData.getUserById(id)
        delete user.password
        res.json(user)
    },
    patchUser(req, res) {
        if (req.body.login)
            req.body.login = req.body.login.trim()
        if (req.body.password)
            req.body.password = req.body.password.trim()
        if (req.body.oldPassword)
            req.body.oldPassword = req.body.oldPassword.trim()

        const id = req.params.id
        const error = usersData.update(id, req.body)
        res.json({ error: error })
    }
}
module.exports = usersController