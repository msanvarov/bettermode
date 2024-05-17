import { MongooseModule } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export const rootMongooseTestModule = () => {
  return MongooseModule.forRoot('mongodb://localhost:27017/nestjs_test_db');
};

export const closeInMongodConnection = async () => {
  await mongoose.disconnect();
  await mongoose.connection.close();
};
