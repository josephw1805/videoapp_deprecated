import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { EngagementType, type PrismaClient } from "@prisma/client";
type Context = {
  db: PrismaClient;
};

async function getOrCreatePlaylist(
  ctx: Context,
  title: string,
  userId: string,
) {
  let playlist = await ctx.db.playlist.findFirst({
    where: { title, userId },
  });

  if (playlist === null || playlist === undefined) {
    playlist = await ctx.db.playlist.create({
      data: { title, userId },
    });
  }

  return playlist;
}

async function deleteEngagementIfExists(
  ctx: Context,
  id: string,
  userId: string,
  type: EngagementType,
) {
  const existingEngagement = await ctx.db.videoEngagement.findMany({
    where: {
      videoId: id,
      userId,
      engagementType: type,
    },
  });
  if (existingEngagement.length > 0) {
    await ctx.db.videoEngagement.deleteMany({
      where: {
        videoId: id,
        userId,
        engagementType: type,
      },
    });
  }
}

async function createEngagement(
  ctx: Context,
  id: string,
  userId: string,
  type: EngagementType,
) {
  return await ctx.db.videoEngagement.create({
    data: { videoId: id, userId, engagementType: type },
  });
}

export const videoEngagementRouter = createTRPCRouter({
  addLike: protectedProcedure
    .input(z.object({ id: z.string(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await deleteEngagementIfExists(
        ctx,
        input.id,
        input.userId,
        EngagementType.DISLIKE,
      );
      const existingLike = await ctx.db.videoEngagement.findMany({
        where: {
          videoId: input.id,
          userId: input.userId,
          engagementType: EngagementType.LIKE,
        },
      });
      const playlist = await getOrCreatePlaylist(
        ctx,
        "Liked Videos",
        input.userId,
      );
      if (existingLike.length > 0) {
        await ctx.db.playlistHasVideo.deleteMany({
          where: {
            playlistId: playlist.id,
            videoId: input.id,
          },
        });
        return await deleteEngagementIfExists(
          ctx,
          input.id,
          input.userId,
          EngagementType.LIKE,
        );
      } else {
        await ctx.db.playlistHasVideo.create({
          data: { playlistId: playlist.id, videoId: input.id },
        });
        return await createEngagement(
          ctx,
          input.id,
          input.userId,
          EngagementType.LIKE,
        );
      }
    }),

  addDislike: protectedProcedure
    .input(z.object({ id: z.string(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await deleteEngagementIfExists(
        ctx,
        input.id,
        input.userId,
        EngagementType.LIKE,
      );
      const existingDislike = await ctx.db.videoEngagement.findMany({
        where: {
          videoId: input.id,
          userId: input.userId,
          engagementType: EngagementType.DISLIKE,
        },
      });
      const playlist = await getOrCreatePlaylist(
        ctx,
        "Liked Videos",
        input.userId,
      );
      await ctx.db.playlistHasVideo.deleteMany({
        where: {
          playlistId: playlist.id,
          videoId: input.id,
        },
      });

      if (existingDislike.length > 0) {
        return await deleteEngagementIfExists(
          ctx,
          input.id,
          input.userId,
          EngagementType.DISLIKE,
        );
      } else {
        return await createEngagement(
          ctx,
          input.id,
          input.userId,
          EngagementType.DISLIKE,
        );
      }
    }),

  addViewCount: publicProcedure
    .input(z.object({ id: z.string(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (input.userId !== "") {
        const playlist = await getOrCreatePlaylist(
          ctx,
          "History",
          input.userId,
        );

        await ctx.db.playlistHasVideo.create({
          data: { playlistId: playlist.id, videoId: input.id },
        });
      }
      const view = await createEngagement(
        ctx,
        input.id,
        input.userId,
        EngagementType.VIEW,
      );
      return view;
    }),
});
