import { NextFunction, Request, Response, Router } from 'express';
import { PostControllers } from './post.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user-constant';
import validateRequest from '../../middleware/validateRequest';
import { PostValidations } from './post.validation';
import { uploadFile } from '../../helper/fileUploader';

const router = Router();

router.post('/create-post',
    auth(USER_ROLE.admin, USER_ROLE.user),
    uploadFile(),
    (req: Request, res: Response, next: NextFunction) => {
        if (req.body.data) {
            req.body = JSON.parse(req.body.data);
        }
        next();
    },
    validateRequest(PostValidations.createPostValidationSchema),
    PostControllers.createPost
);

router.patch('/update-post/:id',
    auth(USER_ROLE.user),
    uploadFile(),
    (req: Request, res: Response, next: NextFunction) => {
        if (req.body.data) {
            req.body = JSON.parse(req.body.data);
        }
        next();
    },
    validateRequest(PostValidations.updatePostValidationSchema),
    PostControllers.updatePost
);

router.get('/post/:postId', PostControllers.getPostById);


router.delete('/post/:postId', auth(USER_ROLE.admin, USER_ROLE.user), PostControllers.deletePost);


router.get('/posts', PostControllers.getAllPosts);

export const CommunityRoutes = router;
