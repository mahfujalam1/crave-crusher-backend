import { Router } from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user-constant';
import { UserBadgeControllers } from './userBadge.controller';

const router = Router();

router.patch(
    '/claim-badge/:badgeId',
    auth(USER_ROLE.user),
    UserBadgeControllers.claimBadge
);

router.get('/completed-badges', auth(USER_ROLE.user), UserBadgeControllers.gainedBadges)
router.get('/claimed-badges', auth(USER_ROLE.user), UserBadgeControllers.claimedBadges)

export const UserBadgeRoutes = router;