import { createTRPCRouter } from "~/server/api/trpc";
import { videoRouter } from "./routers/video";
import { videoEngagementRouter } from "./routers/videoEngagement";
import { userRouter } from "./routers/user";
import { commentRouter } from "./routers/comments";
import { playlistRouter } from "./routers/playlist";
import { announcementRouter } from "./routers/announcements";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  video: videoRouter,
  user: userRouter,
  playlist: playlistRouter,
  comment: commentRouter,
  announcement: announcementRouter,
  videoEngagement: videoEngagementRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
