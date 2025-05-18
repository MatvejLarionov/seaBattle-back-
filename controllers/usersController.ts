import usersData from "../data/usersData"
import { Request, Response } from 'express';
import { User, UserDataForAuthorization, UserDataForRegistration, UserDataForUpdate } from "../types/user";
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
    registration(req: Request<{}, {}, UserDataForRegistration>, res: Response) {
        req.body.login = req.body.login.trim()
        req.body.password = req.body.password!.trim()
        const user: UserDataForRegistration = req.body
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

        delete newUser.password
        res.json(newUser)
    },
    authorization(req: Request<{}, {}, UserDataForAuthorization>, res: Response) {
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

        delete user.password
        res.json(user)
    },
    patchUser(req: Request<{ id: string }, {}, UserDataForUpdate>, res: Response) {
        const id = req.params.id
        const user: User | undefined = usersData.getUserById(id)
        if (user === undefined) {
            res.json({ error: ServerErrors.notFound })
            return
        }
        if (req.body.oldPassword.trim() !== user.password) {
            res.json({ error: ServerErrors.notFound })
            return
        }

        if (req.body.login) {
            user.login = req.body.login.trim()
            if (usersData.isLoginRepeat(user.login)) {
                res.json({ error: ServerErrors.loginRepeat })
                return
            }
        }
        if (req.body.password) {
            user.password = req.body.password.trim()
            if (!isCorrectPassword(user.password)) {
                res.json({ error: ServerErrors.passwordIsNotCorrect })
                return
            }
        }

        usersData.setUser(id, user)

        delete user.password
        res.json(user)
    }
}

export default usersController