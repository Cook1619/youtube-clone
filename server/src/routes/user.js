import express from "express";
import { protect } from "../middleware/authorization";
import { PrismaClient } from "@prisma/client";
import { getVideoViews } from "../controllers/video";

const prisma = new PrismaClient();

function getUserRoutes() {
  const router = express.Router();

  router.get("/liked-videos", protect, getLikedVideos);

  return router;
}

async function getLikedVideos(req, res) {
  const videoLikes = await prisma.videoLike.findMany({
    where: {
      userId: req.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const videoIds = videoLikes.map(videoLike => videoLike.videoId);

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

async function getHistory(req, res) {
  await getVideos(prisma.view, req, res);
}

async function toggleSubscribe(req, res, next) {}

async function getFeed(req, res) {}

async function searchUser(req, res, next) {}

async function getRecommendedChannels(req, res) {}

async function getProfile(req, res, next) {}

async function editUser(req, res) {}

export { getUserRoutes };
