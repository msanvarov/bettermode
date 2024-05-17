
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export enum TweetCategory {
    Sport = "Sport",
    Finance = "Finance",
    Tech = "Tech",
    News = "News"
}

export enum PermissionType {
    View = "View",
    Edit = "Edit"
}

export interface CreateGroupInput {
    userIds: string[];
    groupIds: string[];
}

export interface CreateTweetInput {
    authorId: string;
    content: string;
    hashtags?: Nullable<string[]>;
    parentTweetId?: Nullable<string>;
    category: TweetCategory;
    location: string;
}

export interface UpdateTweetPermissionsInput {
    tweetId: string;
    inheritViewPermissions: boolean;
    inheritEditPermissions: boolean;
    viewPermissions: string[];
    editPermissions: string[];
}

export interface User {
    id: string;
    username: string;
    email: string;
    tweets: Tweet[];
    groups: Group[];
}

export interface Group {
    id: string;
    userIds: string[];
    groupIds: string[];
}

export interface GroupMembership {
    id: string;
    group: Group;
    user?: Nullable<User>;
    subgroup?: Nullable<Group>;
}

export interface Tweet {
    id: string;
    createdAt: DateTime;
    author: User;
    content: string;
    parentTweetId?: Nullable<string>;
    category: TweetCategory;
    location: string;
    permissions: TweetPermission[];
}

export interface TweetPermission {
    id: string;
    tweet: Tweet;
    permissionType: PermissionType;
    inherit: boolean;
    group?: Nullable<Group>;
}

export interface PaginatedTweet {
    nodes: Tweet[];
    hasNextPage: boolean;
}

export interface IQuery {
    user(id: string): User | Promise<User>;
    paginateTweets(userId: string, limit: number, page: number): PaginatedTweet | Promise<PaginatedTweet>;
    canEditTweet(userId: string, tweetId: string): boolean | Promise<boolean>;
}

export interface IMutation {
    createUser(username: string, email: string): User | Promise<User>;
    createGroup(input: CreateGroupInput): Group | Promise<Group>;
    createTweet(input: CreateTweetInput): Tweet | Promise<Tweet>;
    updateTweetPermissions(input: UpdateTweetPermissionsInput): boolean | Promise<boolean>;
}

export type DateTime = any;
type Nullable<T> = T | null;
