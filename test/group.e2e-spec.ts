import { HttpStatus, INestApplication } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from './mongoose-test-module';

describe('Group and User E2E Tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        rootMongooseTestModule(), // Ensure you have a utility to connect to a test MongoDB instance
        MongooseModule.forRoot('mongodb://localhost/nestjs_test_db'),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await closeInMongodConnection(); // Ensure you properly close your DB connection after tests
    await app.close();
  });

  it('Create User', async () => {
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation {
          createUser(username: "testuser", email: "testuser@example.com") {
            username
            email
          }
        }`,
      });

    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.data.createUser.username).toEqual('testuser');
    expect(response.body.data.createUser.email).toEqual('testuser@example.com');
  });

  it('Create Group with the first user as the creator', async () => {
    const createUserResponse = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation {
          createUser(username: "group_creator", email: "creator@example.com") {
            id
            username
            email
          }
        }`,
      });

    const userId = createUserResponse.body.data.createUser.id;

    const createGroupResponse = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation {
          createGroup(input: {userIds: ["${userId}"], groupIds: []}) {
            userIds
          }
        }`,
      });

    expect(createGroupResponse.status).toBe(HttpStatus.OK);
    expect(createGroupResponse.body.data.createGroup.userIds).toContain(userId);
  });
});
