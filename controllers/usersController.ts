import usersData from "../data/usersData"
import { Request, Response } from 'express';
import { User } from "../types/user";
import { ServerErrors } from "../types/enums";
const isCorrectPassword = (password: string): boolean => {
    if (password.length < 8)
        return false
    if (!password.split("").find(item =>
        item.charCodeAt(0) < "0".charCodeAt(0) ||
        item.charCodeAt(0) > "9".charCodeAt(0)))
        return false
    return true
}
const usersController = {
    registration(req: Request<{}, {}, User>, res: Response) {
        req.body.login = req.body.login.trim()
        req.body.password = req.body.password!.trim()
        const user: User = req.body
        if (!user.login || !user.password) {
            res.json({ error: ServerErrors.emptyFields })
            return
        }
        if (usersData.isLoginRepeat(user.login)) {
            res.json({ error: ServerErrors.loginRepeat })
            return
        }
        if (!isCorrectPassword(user.password)) {
            res.json({ error: ServerErrors.passwordIsNotCorrect })
            return
        }
        const newUser = usersData.create(user)
        res.json(newUser)
    },
    authorization(req: Request<{}, {}, User>, res: Response) {
        req.body.login = req.body.login.trim()
        req.body.password = req.body.password!.trim()
        if (!req.body.login || !req.body.password) {
            res.json({ error: ServerErrors.emptyFields })
            return
        }
        const user = usersData.read({ login: req.body.login, password: req.body.password })[0]
        if (!user) {
            res.json({ error: ServerErrors.notFound })
            return
        }
        delete user.password
        res.json(user)
    },
    getUser(req: Request<{ id: string }, {}, User>, res: Response) {
        const id = req.params.id
        const user = usersData.getUserById(id)
        if (!user) {
            res.json({ error: ServerErrors.notFound })
            return
        }
        res.json(user)
    },
    // patchUser(req: Request<{}, {}, { login: string, password: string }>, res: Response) {
    //     if (req.body.login)
    //         req.body.login = req.body.login.trim()
    //     if (req.body.password)
    //         req.body.password = req.body.password.trim()
    //     if (req.body.oldPassword)
    //         req.body.oldPassword = req.body.oldPassword.trim()

    //     const id = req.params.id
    //     const error = usersData.update(id, req.body)
    //     res.json({ error: error })
    // }
}

export default usersController