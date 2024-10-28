import {Router} from "express"
import {handleSubmitProblem} from "../controllers/problem";

const problemRouter = Router();
problemRouter.route('/:id/submit').post(handleSubmitProblem as any);

export default problemRouter;
