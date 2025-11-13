import { Router } from "express";
import {
  createVideo,
  getAllVideos,
  getVideoById,
  updateVideo,
  deleteVideo,
} from "../controllers/video.controller.js";

const router = Router();

router.route("/videos").post(createVideo).get(getAllVideos);
router
  .route("/videos/:id")
  .get(getVideoById)
  .put(updateVideo)
  .delete(deleteVideo);
  

export default router;