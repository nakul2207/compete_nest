import { Router } from "express";
import {
  handleAllUsers,
  updateUserRole,
  deleteUser,
  getUserProgress,
} from "../controllers/user";
import { getProfile,getSolvedProblems,getContestParticipated,getUser,updateProfile } from "../controllers/profile"; 
import { changePassword } from "../auth/auth";
import { authenticate } from "../middlewares/auth";

const userRouter = Router();
userRouter.route("/all").get(handleAllUsers as any);
userRouter.route("/role/:id").put(updateUserRole as any);
userRouter.route("/:id").delete(deleteUser as any);
userRouter.route("/userdetails").get(authenticate as any,getUser as any);
userRouter.route("/profile/:username").get(getProfile as any);
userRouter.route("/:username/solvedProblems").get(getSolvedProblems as any);
userRouter.route("/:username/contestParticipated").get(getContestParticipated as any);
userRouter.route("/updateProfile").put(authenticate as any,updateProfile as any);
userRouter.route("/changePassword").put(authenticate as any,changePassword as any);
userRouter
  .route("/getProgress")
  .get(authenticate as any, getUserProgress as any);

export default userRouter;
