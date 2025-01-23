import { Router } from "express";
import { handleAllUsers,updateUserRole,deleteUser } from "../controllers/user";

const userRouter = Router();
userRouter.route('/all').get(handleAllUsers as any);
userRouter.route('/role/:id').put(updateUserRole as any);
userRouter.route('/:id').delete(deleteUser as any);

export default userRouter;