import { Router } from 'express';
import { UserRotues } from '../modules/user/user-route';
import { AuthRotues } from '../modules/auth/auth-route';
import { CommunityRoutes } from '../modules/community/post.route';
import { VoteRoutes } from '../modules/vote/vote.route';
import { CommentRoutes } from '../modules/comment/comment.route';
import { ManageRoutes } from '../modules/manage-web/manage.routes';
import { BattleRoutes } from '../modules/battle/battle.route';
import { BadgeProgressRoutes } from '../modules/badgeProgress/badgeProgress.route';
import { BadgeRoutes } from '../modules/badge/badge.route';
import { UserBadgeRoutes } from '../modules/userBadge/userBadge.route';

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
  {
    path: '/community-post',
    route: CommunityRoutes,
  },
  {
    path: '/community-vote',
    route: VoteRoutes,
  },
  {
    path: '/community-comment',
    route: CommentRoutes,
  },
  {
    path: '/manage-web',
    route: ManageRoutes,
  },
  {
    path: '/battle',
    route: BattleRoutes,
  },
  {
    path: '/badge',
    route: BadgeProgressRoutes,
  },
  {
    path: '/badge',
    route: BadgeRoutes,
  },
  {
    path: '/user-badge',
    route: UserBadgeRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
