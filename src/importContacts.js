import mongoose from "mongoose";
import dotenv from "dotenv";
import contactsModel from "./models/contacts.js";

dotenv.config();

async function importContacts() {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await contactsModel.deleteMany({});

    await contactsModel.insertMany(contactsModel);
    console.log("Contacts imported successfully!");
  } catch (error) {
    console.error("Error importing contacts:", error);
  } finally {
    mongoose.connection.close();
  }
}

importContacts();