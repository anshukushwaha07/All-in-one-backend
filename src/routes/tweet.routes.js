import { Router } from "express";

import {
  createTweet,
  getAllTweets,
  getTweetById,
  updateTweet,
  deleteTweet,
} from "../controllers/tweet.controller.js";

const router = Router();

router.route("/tweets").post(createTweet).get(getAllTweets);
router
  .route("/tweets/:id")
  .get(getTweetById)
  .put(updateTweet)
  .delete(deleteTweet);

export default router;