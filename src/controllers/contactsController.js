import contactsModel from "../models/contacts.js";
import { findContactById } from "../services/contacts.js";
import mongoose from "mongoose";
import ctrlWrapper from "../utils/ctrlWrapper.js";
import { createContact } from "../services/contacts.js";
import { updateContactById } from "../services/contacts.js";
import { deleteContactById } from "../services/contacts.js";
import createError from "http-errors";

const getContactsController = async (req, res) => {
  const {
    page = 1,
    perPage = 10,
    sortBy = "name",
    sortOrder = "asc",
  } = req.query;
  const pageNumber = parseInt(page, 10);
  const perPageNumber = parseInt(perPage, 10);
  const totalItems = await contactsModel.countDocuments();
  const skip = (pageNumber - 1) * perPageNumber;
  const sortDirection = sortOrder === "desc" ? -1 : 1;
  const contacts = await contactsModel
    .find()
    .skip(skip)
    .limit(perPageNumber)
    .sort({ [sortBy]: sortDirection });

  const totalPages = Math.ceil(totalItems / perPageNumber);

  res.status(200).json({
    status: 200,
    message: "Successfully found contacts!",
    data: {
      data: contacts,
      page: pageNumber,
      perPage: perPageNumber,
      totalItems,
      totalPages,
      hasPreviousPage: pageNumber > 1,
      hasNextPage: pageNumber < totalPages,
    },
  });
};

const getContactById = async (req, res) => {
  const { contactId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(contactId)) {
    return res.status(400).json({
      message: "Invalid contact ID format",
    });
  }

  const contact = await findContactById(contactId);

  if (!contact) {
    return res.status(404).json({
      message: "Contact not found",
    });
  }

  res.status(200).json({
    status: 200,
    message: `Successfully found contact with id ${contactId}!`,
    data: contact,
  });
};

const createContactController = async (req, res) => {
  const { name, phoneNumber, email, isFavourite, contactType } = req.body;

  if (!name || !phoneNumber || !contactType) {
    return res.status(400).json({
      status: 400,
      message: "Missing required fields: name, phoneNumber, contactType",
    });
  }

  const newContact = await createContact({
    name,
    phoneNumber,
    email,
    isFavourite,
    contactType,
  });

  res.status(201).json({
    status: 201,
    message: "Successfully created a contact!",
    data: newContact,
  });
};

const updateContactController = async (req, res) => {
  const { contactId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(contactId)) {
    throw createError(400, "Invalid contact ID format");
  }

  const updatedContact = await updateContactById(contactId, req.body);

  if (!updatedContact) {
    throw createError(404, "Contact not found");
  }

  res.status(200).json({
    status: 200,
    message: "Successfully patched a contact!",
    data: updatedContact,
  });
};

const deleteContactController = async (req, res) => {
  const { contactId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(contactId)) {
    throw createError(400, "Invalid contact ID format");
  }

  const deletedContact = await deleteContactById(contactId);

  if (!deletedContact) {
    throw createError(404, "Contact not found");
  }

  res.status(204).send();
};

export default {
  getContactsController: ctrlWrapper(getContactsController),
  getContactById: ctrlWrapper(getContactById),
  createContactController: ctrlWrapper(createContactController),
  updateContactById: ctrlWrapper(updateContactController),
  deleteContactById: ctrlWrapper(deleteContactController),
};