import { Router } from 'express';
import { UserRoutes } from '../modules/user/user-route';
import { AuthRoutes } from '../modules/auth/auth-route';
import { CommunityRoutes } from '../modules/community/post.route';
import { VoteRoutes } from '../modules/vote/vote.route';
import { CommentRoutes } from '../modules/comment/comment.route';
import { ManageRoutes } from '../modules/manage-web/manage.routes';
import { BattleRoutes } from '../modules/battle/battle.route';
import { BadgeProgressRoutes } from '../modules/badgeProgress/badgeProgress.route';
import { BadgeRoutes } from '../modules/badge/badge.route';
import { UserBadgeRoutes } from '../modules/userBadge/userBadge.route';
import { notificationRoutes } from '../modules/notification/notification.routes';
import { metaRoutes } from '../modules/meta/meta.routes';

const router = Router();

const moduleRoutes = [
  {
    path: '/user',
    route: UserRoutes,
  },
  {
    path: '/auth',
    route: AuthRoutes,
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
    path: '/meta',
    route: metaRoutes,
  },
  {
    path: '/badge',
    route: BadgeRoutes,
  },
  {
    path: '/user-badge',
    route: UserBadgeRoutes,
  },
  {
    path: '/notification',
    route: notificationRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
