import {Router} from "express"
import {handleSubmitProblem, handleRunProblem, handleCreateProblem, handleGetAllProblem, handleGetFilterProblems, handleGetProblemById, handleGetAllExampleTestcases, handleGetSubmissions} from "../controllers/problem";

const problemRouter = Router();
problemRouter.route('/:id/submit').post(handleSubmitProblem as any)
problemRouter.route('/:id/run').post(handleRunProblem as any)
problemRouter.route('/create').post(handleCreateProblem as any);
problemRouter.route('/all').get(handleGetAllProblem as any);
problemRouter.route('/filter').get(handleGetFilterProblems as any);
problemRouter.route('/:id').get(handleGetProblemById as any);
problemRouter.route('/:id/example_testcases').get(handleGetAllExampleTestcases as any);
problemRouter.route('/:id/submissions').get(handleGetSubmissions as any);

export default problemRouter;
