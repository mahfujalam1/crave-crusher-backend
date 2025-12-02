import { Router } from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user-constant';
import { UserBadgeControllers } from './userBadge.contoroller';

const router = Router();

router.patch(
    '/claim-badge/:badgeId',
    auth(USER_ROLE.user),
    UserBadgeControllers.claimBadge
);

export const UserBadgeRoutes = router;