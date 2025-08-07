import {Router} from "express"
import {logoutUser,loginUser,registerUser} from "../controllers/user.controller.js"
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJwt } from "../middlewares/auth.middleware.js"
const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxcoutn:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser
)
router.route("/login").post(loginUser)


//secured Routes

router.route("/logout").post(verifyJwt,logoutUser)
export default router