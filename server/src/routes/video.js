import express from "express";
import { getAuthUser, protect } from "../middleware/authorization";
import * as VideoController from "../controllers/video";

function getVideoRoutes() {
  const router = express.Router();

  router.get("/", VideoController.getRecommendedVideos);
  router.post("/", protect, VideoController.addVideo);
  router.get("/trending", VideoController.getTrendingVideos);
  router.get("/search", VideoController.searchVideos);

  router.get("/:videoId", getAuthUser, VideoController.getVideo);
  router.delete("/:videoId", protect, VideoController.deleteVideo);

  router.get("/:videoId/view", getAuthUser, VideoController.addVideoView);
  router.get("/:videoId/like", protect, VideoController.likeVideo);
  router.get("/:videoId/dislike", protect, VideoController.dislikeVideo);
  router.post("/:videoId/comments", protect, VideoController.addComment);
  router.delete(
    "/:videoId/comments/:commentId",
    protect,
    VideoController.deleteComment
  );

  return router;
}

export { getVideoRoutes };
