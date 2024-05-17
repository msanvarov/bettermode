# Bettermode

### Requirements

- **Goal**: A robust permission system for tweets with dynamic groups and permissions.
- **Key Features**:
  - Users can create private groups.
  - Users can add other users or groups to these groups.
  - Authors set permissions on tweets for viewing and editing.
  - Support inheritance of permissions from parent tweets.

---

### Tech Stack

- **Language**: TypeScript
- **Framework**: NestJS
- **Database**: MongoDB
- **API**: GraphQL using Apollo

---

### 🛠️ Prerequisites

#### Non Docker

- Please ensure to have [Node.js](https://nodejs.org/en/download/) (16+) locally by downloading the Javascript runtime via `brew`, `choco`, or `apt-get`.

- Please ensure to have PostgreSQL locally by download from [Postgres website](https://www.postgresql.org/download/). The control panel can then trigger PostgreSQL to start on localhost. PostgreSQL can be downloaded standalone via `brew`, `choco`, or `apt-get`.

#### Docker 🐳

- Please make sure to have [Docker Desktop](https://www.docker.com/products/docker-desktop/) operational to quickly compose the required dependencies. Then follow the docker procedure outlined below.

---

### 🚀 Deployment

#### Manual Deployment without Docker

- Clone the repo via `git clone https://github.com/msanvarov/bettermode`.

- Download dependencies via `npm i` or `yarn`.

- Create a **.env file** via the `cp .env.example .env` command and replace the existing environment variable placeholders with valid responses.

- Start the api in development mode by using `npm run start` (the app will be exposed on http://localhost:3333; not to conflict with React, Angular, or Vue ports).

- Navigate to http://localhost:3333/graphql for the GraphQL playground.

- Example queries and mutations:

```graphql
query {
  user(id: "<UID>") {
    id
    email
    username
  }
}
```

```graphql
mutation {
  createUser(username: "sal", email: "sal@grr.la") {
    id
    username
    email
  }
  createGroup(input: { userIds: ["<UID>"], groupIds: ["<GROUP_ID>"] }) {
    id
  }
  createTweet(
    input: {
      authorId: "<UID>"
      content: "What is life?"
      hashtags: ["#life"]
      category: News
      location: "Toronto"
    }
  ) {
    id
    createdAt
    content
    parentTweetId
    category
    location
  }
}
```

---

## Testing

- Unit tests: `npm run test`
- E2E tests: `npm run test:e2e`

---

## Development Plan

### Define the Data Model

#### Database Schema

1.  **Users**

    - `id`: Primary Key
    - `username`: String
    - `email`: String

2.  **Groups**

    - `id`: Primary Key
    - `userIds`: Array of Users
    - `groupIds`: Array of Groups

3.  **Tweets**

    - `id`: Primary Key
    - `authorId`: Author Key
    - `content`: Text
    - `parentTweetId`: Parent Tweet Key
    - `category`: Enum (Sport, Finance, Tech, News)
    - `location`: String
    - `createdAt`: DateTime

4.  **TweetPermissions**

    - `tweetId`: Tweet Key
    - `permissionType`: Enum (View, Edit)
    - `inherit`: Boolean
    - `groupId`: Group Key

#### Indices

- Create indices on `creatorId`, `userId`, `groupId`, and `authorId` for faster lookup.

### API Design

Nest with GraphQL - Below are the GraphQL resolvers & types.

#### GraphQL Resolvers & Types

1.  **Create Group**

    - **Mutation**: `createGroup(input: CreateGroup!)`
    - **Logic**:
      - Create a group with the given users and subgroups.
      - Ensure cyclic group references are prevented.

2.  **Create Tweet**

    - **Mutation**: `createTweet(input: CreateTweet!)`
    - **Logic**:
      - Insert a new tweet.
      - If `parentTweetId` is present, handle permission inheritance based on input.

3.  **Update Tweet Permissions**

    - **Mutation**: `updateTweetPermissions(input: UpdateTweetPermissions!)`
    - **Logic**:
      - Update the permission settings for a tweet, managing inheritance flags and specific permissions.

4.  **Paginate Tweets**

    - **Query**: `paginateTweets(userId: String!, limit: Int!, page: Int!)`
    - **Logic**:
      - Fetch tweets viewable by a user, applying pagination.
      - Sort by `createdAt` in descending order.

5.  **Can Edit Tweet**

    - **Query**: `canEditTweet(userId: String!, tweetId: String!)`
    - **Logic**:
      - Determine if a user can edit a specific tweet by checking direct and inherited permissions.

### Potential Limitations

- Handling billions of users and tweets with optimal performance might require strategies like more complex caching mechanisms.
- Recursive group memberships can be challenging and need careful management to prevent infinite loops.

---

## Further Enhancements

1.  **Database Design and Indices:**

    - The current design may lead to some shortcomings, particularly with the recursive structure of groups and large volume of tweets.
    - **Optimization**: Using a graph databases for managing complex group memberships or ensure efficient indexing and querying strategies in relational databases would be beneficial. For instance, appending more specific indices based on access patterns could help.

2.  **Handling Recursive Group Memberships:**

    - Managing and resolving recursive group memberships in a performant way is challenging. The current approach does not explicitly optimize the recursive resolution of group memberships.
    - **Optimization**: Path enumeration or materialized path techniques to manage hierarchical data, which can benefit queries involving deep group hierarchies.

3.  **Permission Checks:**

    - The permission checks, as designed, can be slow, especially with deep inheritance and complex group memberships.
    - **Optimization**: Use caching strategies for permission checks. For instance, implementing a distributed cache (like Redis) that can hold frequently accessed permissions can reduce database load and improve response times.

4.  **Data Fetching and GraphQL Resolvers:**

    - The GraphQL resolvers might over fetch, especially with nested structures.
    - **Optimization**: Implement the DataLoader pattern to batch and cache requests at the resolver level to prevent the N+1 queries problem, especially for permissions and group memberships.

5.  **Bulk Operations:**

    - The system might be slow when handling operations that could affect many tweets or users at once due to the lack of bulk processing.
    - **Optimization**: Support bulk inserts and updates in the service layer to handle operations involving large numbers of tweets or permissions efficiently.

6.  **Asynchronous Processing:**

    - Some operations, like editing inherited permissions, could benefit from asynchronous processing to avoid blocking important user interactions.
    - **Optimization**: A background jobs or a message queue (like RabbitMQ or Kafka) for operations that can be processed asynchronously, such as cascading permission updates.
