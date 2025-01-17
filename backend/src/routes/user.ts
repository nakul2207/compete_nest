import { Router } from "express";
import { handleAllUsers,updateUserRole,deleteUser } from "../controllers/user";

const userRouter = Router();
userRouter.route('/users').get(handleAllUsers as any);
userRouter.route('/user/role/:id').put(updateUserRole as any);
userRouter.route('/user/:id').delete(deleteUser as any);

export default userRouter;