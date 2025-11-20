import { Router } from "express";
import { AuthControllers } from "./auth-controller";
import validateRequest from "../../middleware/validateRequest";
import { authValidations } from "./auth-validation";

const router = Router();
router.post("/signin", validateRequest(authValidations.loginValidation), AuthControllers.logInUser);

router.post(
    '/forget-password',
    validateRequest(authValidations.forgetPasswordValidationSchema),
    AuthControllers.forgetPassword
);

router.post(
    '/reset-password',
    validateRequest(authValidations.resetPasswordValidationSchema),
    AuthControllers.resetPassword
);

router.post(
    '/verify-reset-otp',
    validateRequest(authValidations.verifyResetOtpValidationSchema),
    AuthControllers.verifyResetOtp
);

router.post(
    '/resend-reset-code',
    validateRequest(authValidations.resendResetCodeValidationSchema),
    AuthControllers.resendResetCode
);

router.post(
    '/resend-verify-code',
    validateRequest(authValidations.resendResetCodeValidationSchema),
    AuthControllers.resendResetCode
);

export const AuthRotues = router;