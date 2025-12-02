import { Router } from 'express';
import { BadgeControllers } from './badge.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user-constant';
import validateRequest from '../../middleware/validateRequest';
import { BadgeValidations } from './badge.validation';
import { uploadFile } from '../../helper/fileUploader';

const router = Router();

router.post(
    '/badges',
    // auth(USER_ROLE.admin),
    uploadFile(),
    validateRequest(BadgeValidations.createBadgeValidationSchema),
    BadgeControllers.createBadge
);

router.get('/badges', BadgeControllers.getAllBadges);

router.get('/badges/:badgeId', BadgeControllers.getBadgeById);

router.patch(
    '/badges/:badgeId',
    auth(USER_ROLE.admin),
    uploadFile(),
    validateRequest(BadgeValidations.updateBadgeValidationSchema),
    BadgeControllers.updateBadge
);

router.delete(
    '/badges/:badgeId',
    auth(USER_ROLE.admin),
    BadgeControllers.deleteBadge
);

export const BadgeRoutes = router;