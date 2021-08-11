import express from "express";
import { protect } from "../middleware/authorization";
import { PrismaClient } from "@prisma/client";
import { getVideoViews } from "../controllers/video";

const prisma = new PrismaClient();

function getUserRoutes() {
  const router = express.Router();

  router.get("/liked-videos", protect, getLikedVideos);
  router.get("/history", protect, getHistory);
  router.get("/:userId/toggle-subscribe", protect, toggleSubscribe);

  return router;
}
console.log("test");

async function getLikedVideos(req, res) {
  await getVideos(prisma.videoLike, req, res);
}

async function getHistory(req, res) {
  await getVideos(prisma.view, req, res);
}

async function getVideos(model, req, res) {
  const videoRelations = await model.findMany({
    where: {
      userId: req.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const videoIds = videoRelations.map(videoLike => videoLike.videoId);

  let videos = await prisma.video.findMany({
    where: {
      id: {
        in: videoIds,
      },
    },
    include: {
      user: true,
    },
  });
  if (videos.length) {
    return res.status(200).json({ videos });
  }
  videos = await getVideoViews(videos);

  return res.status(200).json({ videos });
}

async function toggleSubscribe(req, res, next) {
  if (req.user.id === req.params.userId) {
    next({
      message: "You cannot subscribe to your own channel",
      statusCode: 400,
    });
  }
  const user = await prisma.user.findUnique({
    where: {
      id: req.params.userId,
    },
  });
  if (!user) {
    next({
      message: `No user found with id ${req.params.userId}`,
      statusCode: 404,
    });
  }
  const isSubscribed = await prisma.subscription.findFirst({
    where: {
      subscriberId: req.user.id,
    },
    subscribedToId: {
      equals: req.params.userId,
    },
  });
  if (isSubscribed) {
    await prisma.subscription.delete({
      where: {
        id: isSubscribed.id,
      },
    });
  } else {
    await prisma.subscription.create({
      data: {
        subscriber: {
          connect: {
            id: req.user.id,
          },
        },
        subscribedTo: {
          connect: {
            id: req.params.id,
          },
        },
      },
    });
  }
  res.status(200).json({});
}

async function getFeed(req, res) {}

async function searchUser(req, res, next) {}

async function getRecommendedChannels(req, res) {}

async function getProfile(req, res, next) {}

async function editUser(req, res) {}

export { getUserRoutes };
