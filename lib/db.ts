import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI as string);
export const db = client.db(process.env.MONGODB_DATABASE as string);
