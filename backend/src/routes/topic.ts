import { Router } from "express";
import {handleCreateTopic, handleDeleteTopic, handleEditTopic, handleGetAll} from "../controllers/topic";

const topicRouter = Router();
topicRouter.route('/create').post(handleCreateTopic as any);
topicRouter.route('/:id').delete(handleDeleteTopic as any);
topicRouter.route('/:id').put(handleEditTopic as any);
topicRouter.route('/all').get(handleGetAll as any);

export default topicRouter;