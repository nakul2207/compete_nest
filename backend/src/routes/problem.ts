import {Router} from "express"
import {handleSubmitProblem, handleRunProblem, handleCreateProblem} from "../controllers/problem";

const problemRouter = Router();
problemRouter.route('/:id/submit').post(handleSubmitProblem as any)
problemRouter.route('/:id/run').post(handleRunProblem as any)
problemRouter.route('/create').post(handleCreateProblem as any);

export default problemRouter;
