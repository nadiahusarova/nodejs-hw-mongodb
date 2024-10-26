import { Router } from "express";
import contactsController from "../controllers/contactsController.js";
import validateBody from "../middlewares/validateBody.js";
import {
  createContactSchema,
  updateContactSchema,
} from "../validators/contactSchemas.js";
import isValidId from "../middlewares/isValidId.js";

const router = Router();

router.get("/", contactsController.getContactsController);

router.get("/:contactId", isValidId, contactsController.getContactById);

router.post(
  "/",
  validateBody(createContactSchema),
  contactsController.createContactController
);

router.patch(
  "/:contactId",
  isValidId,
  validateBody(updateContactSchema),
  contactsController.updateContactById
);

router.delete("/:contactId", isValidId, contactsController.deleteContactById);

export default router;