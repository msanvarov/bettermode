import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from './mongoose-test-module';

describe('Tweet E2E Tests', () => {
  let app: INestApplication;
  let userId: string;
  let tweetId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, rootMongooseTestModule()],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await closeInMongodConnection();
    await app.close();
  });

  it('Create User for Tweets', async () => {
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation {
          createUser(username: "tweetuser", email: "tweetuser@example.com") {
            id
            username
          }
        }`,
      });

    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.data.createUser.username).toEqual('tweetuser');
    userId = response.body.data.createUser.id;
  });

  it('Create Tweet', async () => {
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation {
          createTweet(input: {
            authorId: "${userId}",
            content: "Hello, world!",
            category: Tech,
            location: "Internet"
          }) {
            id
            content
            category
          }
        }`,
      });

    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.data.createTweet.content).toEqual('Hello, world!');
    expect(response.body.data.createTweet.category).toEqual('Tech');
    tweetId = response.body.data.createTweet.id;
  });

  it('Update Tweet Permissions', async () => {
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation {
          updateTweetPermissions(input: {
            tweetId: "${tweetId}",
            inheritViewPermissions: false,
            inheritEditPermissions: false,
            viewPermissions: ["${userId}"],
            editPermissions: ["${userId}"]
          })
        }`,
      });

    expect(response.status).toBe(HttpStatus.OK);
  });

  it('Check if user can edit the tweet', async () => {
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `query {
          canEditTweet(userId: "${userId}", tweetId: "${tweetId}")
        }`,
      });

    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.data.canEditTweet).toEqual(true);
  });
});
