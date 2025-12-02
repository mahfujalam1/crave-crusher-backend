import { Router } from 'express';
import { BadgeProgressControllers } from './badgeProgress.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user-constant';

const router = Router();

router.get(
    '/badge-progress',
    auth(USER_ROLE.user),
    BadgeProgressControllers.getUserBadgeProgress
);

router.get(
    '/unlocked-badges',
    auth(USER_ROLE.user),
    BadgeProgressControllers.getUserUnlockedBadges
);

export const BadgeProgressRoutes = router;