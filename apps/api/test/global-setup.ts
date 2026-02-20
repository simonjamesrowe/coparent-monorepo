import { MongoMemoryServer } from 'mongodb-memory-server';

export default async function globalSetup() {
  process.env.E2E_TEST_MODE = 'true';
  process.env.MONGOMS_MD5_CHECK = '0';

  const mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri();

  return async () => {
    await mongod.stop();
  };
}
