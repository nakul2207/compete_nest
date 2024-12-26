import {Router} from "express"
import {handleSubmitProblem, handleRunProblem, handleCreateProblem, handleGetAllProblem, handleGetProblemById} from "../controllers/problem";

const problemRouter = Router();
problemRouter.route('/:id/submit').post(handleSubmitProblem as any)
problemRouter.route('/:id/run').post(handleRunProblem as any)
problemRouter.route('/create').post(handleCreateProblem as any);
problemRouter.route('/all').get(handleGetAllProblem as any);
problemRouter.route('/:id').get(handleGetProblemById as any);

export default problemRouter;
