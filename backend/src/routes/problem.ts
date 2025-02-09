import {Router} from "express"
import {handleSubmitProblem, handleRunProblem, handleCreateProblem, handleEditProblem, handleDeleteProblem, handleGetAllProblem, handleGetFilterProblems, handleGetProblemById, handleGetAllExampleTestcases, handleGetSubmissions, handleAdminGetAllProblem, handleAdminGetFilterProblems} from "../controllers/problem";
import { authenticate, authorize } from "../middlewares/auth";

const problemRouter = Router();
problemRouter.route('/:id/submit').post(authenticate as any, handleSubmitProblem as any);
problemRouter.route('/:id/run').post(handleRunProblem as any);
problemRouter.route('/create').post(authenticate as any, authorize(["Admin", "Organiser"]) as any, handleCreateProblem as any);
problemRouter.route('/admin/all').get(authenticate as any, authorize(["Admin", "Organiser"]) as any, handleAdminGetAllProblem as any);
problemRouter.route('/admin/filter').get(authenticate as any, authorize(["Admin", "Organiser"]) as any, handleAdminGetFilterProblems as any);
problemRouter.route('/all').get(handleGetAllProblem as any);
problemRouter.route('/filter').get(handleGetFilterProblems as any);
problemRouter.route('/:id').get(handleGetProblemById as any);
problemRouter.route('/edit').patch(authenticate as any, authorize(["Admin", "Organiser"]) as any, handleEditProblem as any);
problemRouter.route('/:id').delete(authenticate as any, authorize(["Admin", "Organiser"]) as any, handleDeleteProblem as any);
problemRouter.route('/:id/example_testcases').get(handleGetAllExampleTestcases as any);
problemRouter.route('/:id/submissions').get(authenticate as any, handleGetSubmissions as any);

export default problemRouter;
