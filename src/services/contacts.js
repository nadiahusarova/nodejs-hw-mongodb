import contactsModel from "../models/contacts.js";

export const getAllContacts = async () => {
  const contacts = await contactsModel.find();
  return contacts;
};

export const getContactById = async (contactId) => {
  const contact = await contactsModel.findById(contactId);
  return contact;
};

export const findContactById = async (contactId) => {
  try {
    const contact = await contactsModel.findById(contactId);
    return contact;
  } catch (error) {
    console.error(`Error finding contact by ID: ${error.message}`);
    throw error;
  }
};