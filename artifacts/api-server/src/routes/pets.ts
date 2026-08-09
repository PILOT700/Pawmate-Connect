import { Router, type IRouter } from "express";
import { and, eq } from "drizzle-orm";
import { db, petsTable } from "@workspace/db";
import {
  ListMyPetsResponse,
  ListUserPetsParams,
  ListUserPetsResponse,
  CreateMyPetBody,
  UpdatePetParams,
  UpdatePetBody,
  UpdatePetResponse,
  DeletePetParams,
} from "@workspace/api-zod";
import { HttpError } from "../lib/http-error";
import { requireAuth } from "../middlewares/require-auth";

const router: IRouter = Router();

router.get("/users/me/pets", requireAuth, async (req, res) => {
  const pets = await db.select().from(petsTable).where(eq(petsTable.userId, req.user!.id));
  res.json(ListMyPetsResponse.parse(pets));
});

// Registered after /users/me/pets so the literal "me" isn't swallowed by :userId.
router.get("/users/:userId/pets", requireAuth, async (req, res) => {
  const { userId } = ListUserPetsParams.parse(req.params);
  const pets = await db.select().from(petsTable).where(eq(petsTable.userId, userId));
  res.json(ListUserPetsResponse.parse(pets));
});

router.post("/users/me/pets", requireAuth, async (req, res) => {
  const body = CreateMyPetBody.parse(req.body);

  const [pet] = await db
    .insert(petsTable)
    .values({ ...body, userId: req.user!.id })
    .returning();

  // Same `Pet` shape as updatePet's 200 response.
  res.status(201).json(UpdatePetResponse.parse(pet));
});

router.patch("/pets/:petId", requireAuth, async (req, res) => {
  const { petId } = UpdatePetParams.parse(req.params);
  const body = UpdatePetBody.parse(req.body);

  const [pet] = await db
    .update(petsTable)
    .set({ ...body, updatedAt: new Date() })
    .where(and(eq(petsTable.id, petId), eq(petsTable.userId, req.user!.id)))
    .returning();

  if (!pet) {
    throw HttpError.notFound("Pet not found");
  }

  res.json(UpdatePetResponse.parse(pet));
});

router.delete("/pets/:petId", requireAuth, async (req, res) => {
  const { petId } = DeletePetParams.parse(req.params);

  const deleted = await db
    .delete(petsTable)
    .where(and(eq(petsTable.id, petId), eq(petsTable.userId, req.user!.id)))
    .returning({ id: petsTable.id });

  if (deleted.length === 0) {
    throw HttpError.notFound("Pet not found");
  }

  res.status(204).end();
});

export default router;
