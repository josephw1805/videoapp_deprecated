import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { EngagementType } from "@prisma/client";

export const announcementRouter = createTRPCRouter({
  getAnnoucementsByUserId: publicProcedure
    .input(
      z.object({
        id: z.string(),
        viewerId: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const annoucementsWithUser = await ctx.db.announcement.findMany({
        where: {
          userId: input.id,
        },
        include: {
          user: true,
        },
      });
      const annoucements = annoucementsWithUser.map(
        ({ user, ...annoucement }) => annoucement,
      );
      const user = annoucementsWithUser.map(({ user }) => user);
      const announcementsWithEngagements = await Promise.all(
        annoucements.map(async (annoucement) => {
          const likes = await ctx.db.announcementEngagement.count({
            where: {
              announcementId: annoucement.id,
              engagementType: EngagementType.LIKE,
            },
          });
          const dislikes = await ctx.db.announcementEngagement.count({
            where: {
              announcementId: annoucement.id,
              engagementType: EngagementType.DISLIKE,
            },
          });

          let viewerHasLiked = false;
          let viewerHasDisliked = false;

          if (input.viewerId && input.viewerId !== "") {
            viewerHasLiked = !!(await ctx.db.announcementEngagement.findFirst({
              where: {
                announcementId: annoucement.id,
                userId: input.viewerId,
                engagementType: EngagementType.LIKE,
              },
            }));

            viewerHasDisliked =
              !!(await ctx.db.announcementEngagement.findFirst({
                where: {
                  announcementId: annoucement.id,
                  userId: input.viewerId,
                  engagementType: EngagementType.DISLIKE,
                },
              }));
          }
          const viewer = {
            hasLiked: viewerHasLiked,
            hasDisliked: viewerHasDisliked,
          };

          return {
            ...annoucement,
            likes,
            dislikes,
            viewer,
          };
        }),
      );

      return { announcements: announcementsWithEngagements, user };
    }),

  addLikeAnnouncement: protectedProcedure
    .input(z.object({ id: z.string(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existingLike = await ctx.db.announcementEngagement.findMany({
        where: {
          announcementId: input.id,
          userId: input.userId,
          engagementType: EngagementType.LIKE,
        },
      });

      const existingDislike = await ctx.db.announcementEngagement.findMany({
        where: {
          announcementId: input.id,
          userId: input.userId,
          engagementType: EngagementType.DISLIKE,
        },
      });

      if (existingDislike.length > 0) {
        await ctx.db.announcementEngagement.deleteMany({
          where: {
            announcementId: input.id,
            userId: input.userId,
            engagementType: EngagementType.DISLIKE,
          },
        });
      }

      if (existingLike.length > 0) {
        const deleteLike = await ctx.db.announcementEngagement.deleteMany({
          where: {
            announcementId: input.id,
            userId: input.userId,
            engagementType: EngagementType.LIKE,
          },
        });
        return deleteLike;
      } else {
        const like = await ctx.db.announcementEngagement.create({
          data: {
            announcementId: input.id,
            userId: input.userId,
            engagementType: EngagementType.LIKE,
          },
        });

        return like;
      }
    }),

  addDislikeAnnouncement: protectedProcedure
    .input(z.object({ id: z.string(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existingDislike = await ctx.db.announcementEngagement.findMany({
        where: {
          announcementId: input.id,
          userId: input.userId,
          engagementType: EngagementType.DISLIKE,
        },
      });

      const existingLike = await ctx.db.announcementEngagement.findMany({
        where: {
          announcementId: input.id,
          userId: input.userId,
          engagementType: EngagementType.LIKE,
        },
      });

      if (existingLike.length > 0) {
        await ctx.db.announcementEngagement.deleteMany({
          where: {
            announcementId: input.id,
            userId: input.userId,
            engagementType: EngagementType.LIKE,
          },
        });
      }

      if (existingDislike.length > 0) {
        const deleteDislike = await ctx.db.announcementEngagement.deleteMany({
          where: {
            announcementId: input.id,
            userId: input.userId,
            engagementType: EngagementType.DISLIKE,
          },
        });
        return deleteDislike;
      } else {
        const dislike = await ctx.db.announcementEngagement.create({
          data: {
            announcementId: input.id,
            userId: input.userId,
            engagementType: EngagementType.DISLIKE,
          },
        });

        return dislike;
      }
    }),

  addAnnoucement: protectedProcedure
    .input(
      z.object({ userId: z.string(), message: z.string().max(200).min(5) }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.announcement.create({
        data: {
          userId: input.userId,
          message: input.message,
        },
      });
    }),
});
