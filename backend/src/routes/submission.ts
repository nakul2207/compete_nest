import {Router} from "express"
import {handleSubmissionCallback, handleRunCallback, handleContestSubmissionCallback} from "../controllers/submission";
// import socketMiddleware from "../middlewares/socketMiddleware"
// import {io} from "../app"

const submissionRouter = Router();

submissionRouter.route('/:submissionId/submitted_testcase/:id').put(handleSubmissionCallback as any);
submissionRouter.route('/:submissionId/contest/:contestId/submitted_testcase/:id').put(handleContestSubmissionCallback as any);
submissionRouter.route("/run/:id").post(handleRunCallback as any);

export default submissionRouter;