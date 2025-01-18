import { Router } from "express";
import { handleCreateContest, handleDeleteContest, handleEditContest, handleGetContestByID, handleGetAll, handleContestRegister, handleContestUnregister } from "../controllers/contest";

const contestRouter = Router();
contestRouter.route('/create').post(handleCreateContest as any);
contestRouter.route('/:id').delete(handleDeleteContest as any);
contestRouter.route('/:id').put(handleEditContest as any);
contestRouter.route('/:id').get(handleGetContestByID as any);
contestRouter.route('/all').get(handleGetAll as any);
contestRouter.route('/:id/register').get(handleContestRegister as any);
contestRouter.route('/:id/unregister').get(handleContestUnregister as any);
// contestRouter.route()

export default contestRouter;