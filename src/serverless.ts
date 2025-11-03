import type { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';
import app from './app';
import config from './app/config';

const mongoUri = config.db_url;

if (!mongoUri) {
  throw new Error('DB_URL environment variable is not set');
}

declare global {
  // eslint-disable-next-line no-var
  var __mongooseConnection: Promise<typeof mongoose> | undefined;
}

const connectToDatabase = async () => {
  if (!global.__mongooseConnection) {
    global.__mongooseConnection = mongoose.connect(mongoUri, {
      dbName: process.env.DB_NAME,
    });
  }

  return global.__mongooseConnection;
};

export default async function handler(request: VercelRequest, response: VercelResponse) {
  try {
    await connectToDatabase();
    return app(request as unknown as Parameters<typeof app>[0], response as unknown as Parameters<typeof app>[1]);
  } catch (error) {
    console.error('Error handling request:', error);
    response.status(500).json({ success: false, message: 'Internal server error' });
  }
}
