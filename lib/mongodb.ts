import mongoose from 'mongoose';

// Type definition for cached connection to avoid TypeScript errors
interface CachedConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Declare the cached connection in the global scope to persist across hot reloads
declare global {
  var mongooseCache: CachedConnection | undefined;
}

// Initialize or retrieve the cached connection object
const cached: CachedConnection = global.mongooseCache || {
  conn: null,
  promise: null,
};

// Cache the connection in the global object for development
if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

/**
 * Connects to MongoDB using Mongoose
 * Implements connection caching to prevent multiple connections during development
 * 
 * @returns Promise that resolves to the Mongoose instance
 * @throws Error if MONGODB_URI environment variable is not set
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
  // Return cached connection if already established
  if (cached.conn) {
    return cached.conn;
  }

  // Return pending promise if connection is in progress
  if (cached.promise) {
    return cached.promise;
  }

  // Validate that MongoDB URI is configured
  const mongodbUri = process.env.MONGODB_URI;
  if (!mongodbUri) {
    throw new Error('MONGODB_URI environment variable is not defined');
  }

  // Create the connection promise
  cached.promise = mongoose
    .connect(mongodbUri, {
      // Connection options for reliability and performance
      maxPoolSize: 10,
      minPoolSize: 5,
      retryWrites: true,
      w: 'majority',
    })
    .then((result) => {
      cached.conn = result;
      return result;
    });

  try {
    // Wait for the connection to establish
    await cached.promise;
  } catch (error) {
    // Reset promise on error to allow retry
    cached.promise = null;
    throw error;
  }

  return cached.conn!;
}

/**
 * Disconnects from MongoDB
 * Useful for cleanup in tests or graceful shutdown
 */
export async function disconnectFromDatabase(): Promise<void> {
  if (cached.conn) {
    await cached.conn.disconnect();
    cached.conn = null;
    cached.promise = null;
  }
}

export default connectToDatabase;
