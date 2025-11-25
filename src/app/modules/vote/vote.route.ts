import { Router } from 'express';
import { VoteControllers } from './vote.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user-constant';

const router = Router();
router.post('/vote/:postId', auth(USER_ROLE.admin, USER_ROLE.user), VoteControllers.votePost);

// all votes for a post
router.get('/votes/:postId', VoteControllers.allVoteForSinglePost);

export const VoteRoutes = router;
