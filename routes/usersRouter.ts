import express from 'express';
import userController from "../controllers/usersController";

const router = express.Router()

router.use(express.json())
router.post('/registration', userController.registration)
router.post('/authorization', userController.authorization)
router.patch("/:id", userController.patchUser)
router.get("/:id", userController.getUser)

export default router