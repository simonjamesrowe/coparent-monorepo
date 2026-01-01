import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer;

// Start MongoMemoryServer before all tests
beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri();
});

// Stop MongoMemoryServer after all tests
afterAll(async () => {
  if (mongod) {
    await mongod.stop();
  }
});
