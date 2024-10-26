import { Router } from "express";
import contactsController from "../controllers/contactsController.js";

const router = Router();

router.get("/", contactsController.getContactsController);

router.get("/:contactId", contactsController.getContactById);

router.post("/", contactsController.createContactController);

router.patch("/:contactId", contactsController.updateContactById);

router.delete("/:contactId", contactsController.deleteContactById);

export default router;