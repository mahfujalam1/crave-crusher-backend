import { Router } from 'express';
import { BattleControllers } from './battle.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user-constant';
import validateRequest from '../../middleware/validateRequest';
import { BattleValidations } from './battle.validation';

const router = Router();

router.post(
    '/battles',
    auth(USER_ROLE.user),
    validateRequest(BattleValidations.createBattleValidationSchema),
    BattleControllers.createBattle
);

router.patch(
    '/battles/:battleId/status',
    auth(USER_ROLE.user),
    validateRequest(BattleValidations.updateBattleStatusValidationSchema),
    BattleControllers.updateBattleStatus
);

router.get(
    '/battles',
    auth(USER_ROLE.user),
    BattleControllers.getUserBattles
);

router.get(
    '/battles/:battleId',
    auth(USER_ROLE.user),
    BattleControllers.getBattleById
);

router.patch(
    '/battles/:battleId/cancel',
    auth(USER_ROLE.user),
    BattleControllers.cancelBattle
);

export const BattleRoutes = router;