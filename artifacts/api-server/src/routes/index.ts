import { Router, type IRouter } from "express";
import healthRouter from "./health";
import clientErrorsRouter from "./client-errors";
import authRouter from "./auth";
import usersRouter from "./users";
import petsRouter from "./pets";
import preferencesRouter from "./preferences";
import settingsRouter from "./settings";
import discoverRouter from "./discover";
import likesRouter from "./likes";
import passesRouter from "./passes";
import matchesRouter from "./matches";
import messagesRouter from "./messages";
import playdatesRouter from "./playdates";
import eventsRouter from "./events";
import commentsRouter from "./comments";
import storiesRouter from "./stories";
import notificationsRouter from "./notifications";
import blocksRouter from "./blocks";
import reportsRouter from "./reports";

const router: IRouter = Router();

router.use(healthRouter);
router.use(clientErrorsRouter);
router.use(authRouter);
// Registered before usersRouter so /users/me/* isn't shadowed by /users/:userId.
router.use(petsRouter);
router.use(preferencesRouter);
router.use(settingsRouter);
router.use(storiesRouter);
router.use(usersRouter);
router.use(discoverRouter);
router.use(likesRouter);
router.use(passesRouter);
router.use(matchesRouter);
router.use(messagesRouter);
router.use(playdatesRouter);
router.use(eventsRouter);
router.use(commentsRouter);
router.use(notificationsRouter);
router.use(blocksRouter);
router.use(reportsRouter);

export default router;
