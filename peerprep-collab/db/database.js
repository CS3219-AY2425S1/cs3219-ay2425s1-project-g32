import { MongoClient } from 'mongodb';
import dotenv from 'dotenv'

dotenv.config();
const uri = process.env.MONGO_URI;
let db;

async function connectDB() {
    console.log(`uri ${uri}`)
    if (db) return db;
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    db = client.db('collab');
    console.log('Connected to MongoDB');
    return db;
}

export default connectDB;
