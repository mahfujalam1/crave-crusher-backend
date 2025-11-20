import { Router } from "express";
import { UserControllers } from "./user-controller";
import validateRequest from "../../middleware/validateRequest";
import UserValidationSchema from "./user-validation";
import { USER_ROLE } from "./user-constant";
import userValidations from "./user-validation";
import auth from "../../middleware/auth";

const router = Router();

router.post("/signup", validateRequest(userValidations.UserValidationSchema), UserControllers.createUser);

router.post(
    '/verify-code',
    validateRequest(userValidations.verifyCodeValidationSchema),
    UserControllers.verifyCode
);

router.post(
    '/resend-verify-code',
    validateRequest(userValidations.resendVerifyCodeSchema),
    UserControllers.resendVerifyCode
);

router.get(
    '/get-my-profile',
    auth(USER_ROLE.user, USER_ROLE.admin, ),
    UserControllers.getMyProfile
);

export const UserRotues = router;
