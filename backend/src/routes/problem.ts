import {Router} from "express"
import {handleSubmitProblem, handleRunProblem} from "../controllers/problem";

const problemRouter = Router();
problemRouter.route('/:id/submit').post(handleSubmitProblem as any)
problemRouter.route('/:id/run').post(handleRunProblem as any)

export default problemRouter;
