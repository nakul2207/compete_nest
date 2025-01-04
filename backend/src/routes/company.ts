import { Router } from "express";
import { handleCreateCompany,handleGetAll,handleDeleteCompany,handleEditCompany } from "../controllers/company";

const companyRouter = Router();
companyRouter.route('/create').post(handleCreateCompany as any);
companyRouter.route('/:id').delete(handleDeleteCompany as any);
companyRouter.route('/:id').put(handleEditCompany as any);
companyRouter.route('/all').get(handleGetAll as any);

export default companyRouter;