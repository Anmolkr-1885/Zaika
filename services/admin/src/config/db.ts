import { MongoClient, Db } from "mongodb";

let client: MongoClient;
let db: Db;

export const connectDb = async (): Promise<Db> => {
  if (db) return db;

  client = new MongoClient(process.env.MONGO_URI!);
  await client.connect();

  db = client.db(process.env.DB_NAME);

  console.log("Admin service connected to mongodb");

  return db;
};


