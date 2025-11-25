import { Router } from 'express';
import { USER_ROLE } from '../user/user-constant';
import auth from '../../middleware/auth';
import { CommentControllers } from './comment.controller';

const router = Router();

// Create comment
router.post('/comment/:postId', auth(USER_ROLE.user, USER_ROLE.admin), CommentControllers.createComment);

// Edit comment
router.put('/comment/:commentId', auth(USER_ROLE.user, USER_ROLE.admin), CommentControllers.editComment);

// Delete comment
router.delete('/comment/:commentId', auth(USER_ROLE.user, USER_ROLE.admin), CommentControllers.deleteComment);

export const CommentRoutes = router;
