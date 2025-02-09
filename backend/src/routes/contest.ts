import { Router } from "express";
import { handleCreateContest, handleDeleteContest, handleEditContest, handleGetContestByID, handleGetAll, handleContestRegister, handleGetLeaderboard } from "../controllers/contest";
import {authenticate, authorize} from "../middlewares/auth"

const contestRouter = Router();
contestRouter.route('/create').post(authenticate as any, authorize(['Organiser', 'Admin']) as any, handleCreateContest as any);
contestRouter.route('/:id').delete(authenticate as any, authorize(['Organiser', 'Admin']) as any, handleDeleteContest as any);
contestRouter.route('/:id').put(authenticate as any, authorize(['Organiser', 'Admin']) as any, handleEditContest as any);
contestRouter.route('/all').get(authenticate as any, handleGetAll as any);
contestRouter.route('/:id').get(authenticate as any, handleGetContestByID as any);
contestRouter.route('/:id/register').get(authenticate as any, handleContestRegister as any);
contestRouter.route('/:id/leaderboard').get(authenticate as any, handleGetLeaderboard as any);

export default contestRouter;