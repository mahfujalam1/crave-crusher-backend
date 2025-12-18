import { Router } from "express";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user-constant";
import { MonsterControllers } from "./monster.controller";
import { uploadFile } from "../../helper/fileUploader";

const router = Router()

router.post('/create', uploadFile(), MonsterControllers.createMonster)

export const MonsterRoutes = router