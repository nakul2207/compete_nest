import { Router } from "express";
import {
  handleAllUsers,
  updateUserRole,
  deleteUser,
  getUserProgress,
} from "../controllers/user";
import { authenticate } from "../middlewares/auth";

const userRouter = Router();
userRouter.route("/all").get(handleAllUsers as any);
userRouter.route("/role/:id").put(updateUserRole as any);
userRouter.route("/:id").delete(deleteUser as any);
userRouter
  .route("/getProgress")
  .get(authenticate as any, getUserProgress as any);

export default userRouter;
