import { Router } from 'express';
import { UserRotues } from '../modules/user/user-route';
import { AuthRotues } from '../modules/auth/auth-route';

const router = Router();

const moduleRoutes = [
  {
    path: '/user',
    route: UserRotues,
  },
  {
    path: '/auth',
    route: AuthRotues,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
