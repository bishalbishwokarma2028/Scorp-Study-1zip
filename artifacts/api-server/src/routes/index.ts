import { Router, type IRouter } from "express";
import healthRouter from "./health";
import aiRouter from "./ai";
import notesRouter from "./notes";
import historyRouter from "./history";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/ai", aiRouter);
router.use("/notes", notesRouter);
router.use(historyRouter);

export default router;
