import {Router} from "express"
import {handleSubmissionCallback} from "../controllers/submission";

const submissionRouter = Router();
submissionRouter.route('/submitted_testcase/:id').put(handleSubmissionCallback as any);

export default submissionRouter;
