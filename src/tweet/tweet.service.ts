import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GroupDocument, GroupEntity } from '../entities/group.entity';
import {
  TweetPermissionDocument,
  TweetPermissionEntity,
} from '../entities/tweet-permission.entity';
import { TweetDocument, TweetEntity } from '../entities/tweet.entity';
import { UserDocument, UserEntity } from '../entities/user.entity';
import { PermissionType, TweetCategory } from '../graphql';

@Injectable()
export class TweetService {
  constructor(
    @InjectModel(TweetEntity.name) private tweetModel: Model<TweetDocument>,
    @InjectModel(UserEntity.name) private userModel: Model<UserDocument>,
    @InjectModel(TweetPermissionEntity.name)
    private permissionModel: Model<TweetPermissionDocument>,
    @InjectModel(GroupEntity.name) private groupModel: Model<GroupDocument>,
  ) {}

  async createTweet(
    authorId: string,
    content: string,
    parentTweetId?: string,
    category?: TweetCategory,
    location?: string,
  ): Promise<TweetEntity> {
    const author = await this.userModel.findById(authorId);
    if (!author) throw new Error('Author not found');

    const tweet = new this.tweetModel({
      authorId: author._id,
      content,
      parentTweetId,
      category,
      location,
      createdAt: new Date(),
    });

    await tweet.save();

    if (!parentTweetId) {
      // By default, view is open to all (could be represented by a special flag or just lack of any specific view permission)
      // By default, only author can edit
      const editPermission = new this.permissionModel({
        tweet: tweet._id,
        permissionType: PermissionType.Edit,
        inherit: false,
        group: null,
      });
      await editPermission.save();
    } else {
      // Inherit permissions from the parent tweet if specified
      const parentTweet = await this.tweetModel.findById(parentTweetId);
      if (!parentTweet) throw new Error('Parent tweet not found');

      // By default lets toggle inheritance for view and edit permissions
      const inheritViewPermissions = true;
      const inheritEditPermissions = true;

      if (inheritViewPermissions) {
        // Copy view permissions from parent tweet
        const parentViewPermissions = await this.permissionModel.find({
          tweet: parentTweet._id,
          permissionType: PermissionType.View,
        });
        for (const perm of parentViewPermissions) {
          const viewPermission = new this.permissionModel({
            tweet: tweet._id,
            permissionType: PermissionType.View,
            inherit: true,
            groupIds: perm.groupIds,
            userIds: perm.userIds,
          });
          await viewPermission.save();
        }
      }

      if (inheritEditPermissions) {
        // Copy edit permissions from parent tweet
        const parentEditPermissions = await this.permissionModel.find({
          tweet: parentTweet._id,
          permissionType: PermissionType.Edit,
        });
        for (const perm of parentEditPermissions) {
          const editPermission = new this.permissionModel({
            tweet: tweet._id,
            permissionType: PermissionType.Edit,
            inherit: true,
            groupIds: perm.groupIds,
            userIds: perm.userIds,
          });
          await editPermission.save();
        }
      }
    }

    return tweet;
  }

  async updateTweetPermissions(
    tweetId: string,
    inheritViewPermissions: boolean,
    inheritEditPermissions: boolean,
    viewPermissions: string[],
    editPermissions: string[],
  ): Promise<boolean> {
    const tweet = await this.tweetModel.findById(tweetId);
    if (!tweet) throw new Error('Tweet not found');

    // Remove existing permissions related to the tweet
    await this.permissionModel.deleteMany({ tweet: tweet._id });

    // Update View Permissions
    if (!inheritViewPermissions) {
      for (const id of viewPermissions) {
        // Determine whether this is a userId or groupId
        const isUserId = this.userModel.findById(id);
        const isGroupId = this.groupModel.findById(id);
        if (!isUserId && !isGroupId) {
          throw new Error('Error user or group id not found');
        }
        const payload = {
          tweet: tweet._id,
          permissionType: PermissionType.View,
          inherit: false,
          groupIds: [],
          userIds: [],
        };
        if (isUserId) {
          payload.userIds.push(id);
        } else {
          payload.groupIds.push(id);
        }
        const permission = new this.permissionModel(payload);
        await permission.save();
      }
    } else {
      // Inherit view permissions from parent tweet if applicable
      const parentTweet = tweet.parentTweetId
        ? await this.tweetModel.findById(tweet.parentTweetId)
        : null;
      if (parentTweet) {
        const parentPermissions = await this.permissionModel.find({
          tweet: parentTweet._id,
          permissionType: PermissionType.View,
        });
        for (const perm of parentPermissions) {
          const viewPermission = new this.permissionModel({
            tweet: tweet._id,
            permissionType: PermissionType.View,
            inherit: true,
            groupIds: perm.groupIds,
            userIds: perm.userIds,
          });
          await viewPermission.save();
        }
      }
    }

    // Update Edit Permissions
    if (!inheritEditPermissions) {
      for (const id of editPermissions) {
        const isUserId = this.userModel.findById(id);
        const isGroupId = this.groupModel.findById(id);
        if (!isUserId && !isGroupId) {
          throw new Error('Error user or group id not found');
        }
        const payload = {
          tweet: tweet._id,
          permissionType: PermissionType.Edit,
          inherit: false,
          groupIds: [],
          userIds: [],
        };
        if (isUserId) {
          payload.userIds.push(id);
        } else {
          payload.groupIds.push(id);
        }
        const permission = new this.permissionModel(payload);
        await permission.save();
      }
    } else {
      // Inherit edit permissions from parent tweet if applicable
      const parentTweet = tweet.parentTweetId
        ? await this.tweetModel.findById(tweet.parentTweetId)
        : null;
      if (parentTweet) {
        const parentPermissions = await this.permissionModel.find({
          tweet: parentTweet._id,
          permissionType: PermissionType.Edit,
        });
        for (const perm of parentPermissions) {
          const editPermission = new this.permissionModel({
            tweet: tweet._id,
            permissionType: PermissionType.Edit,
            inherit: true,
            groupIds: perm.groupIds,
            userIds: perm.userIds,
          });
          await editPermission.save();
        }
      }
    }

    return true;
  }

  async paginateTweets(userId: string, limit: number, page: number) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new Error('User not found');

    const groups = await this.groupModel.find({ userIds: userId });
    const groupIds = groups.map((group) => group._id);

    const tweets = await this.tweetModel.aggregate([
      {
        $lookup: {
          from: 'tweetpermissionentities',
          localField: '_id',
          foreignField: 'tweet',
          as: 'permissions',
        },
      },
      { $unwind: '$permissions' },
      {
        $match: {
          $or: [
            { 'permissions.group': { $in: groupIds } },
            { 'permissions.inherit': true },
          ],
          'permissions.permissionType': PermissionType.View,
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: limit * (page - 1) },
      { $limit: limit },
    ]);

    const total = await this.tweetModel.countDocuments({
      $or: [
        { 'permissions.group': { $in: groupIds } },
        { 'permissions.inherit': true },
      ],
      'permissions.permissionType': PermissionType.View,
    });

    const hasNextPage = total > limit * page;

    return {
      nodes: tweets,
      hasNextPage,
    };
  }

  async canEditTweet(userId: string, tweetId: string): Promise<boolean> {
    const tweet = await this.tweetModel.findById(tweetId);
    if (!tweet) throw new Error('Tweet not found');

    // If the user is the author, they can always edit the tweet.
    if (tweet.authorId.toString() === userId) {
      return true;
    }

    // Find all groups that this user belongs to
    const userGroups = await this.groupModel.find({ userIds: userId });
    const userGroupIds = userGroups.map((group) => group._id.toString());

    // Find all edit permissions for this tweet
    const editPermissions = await this.permissionModel.find({
      tweet: tweet._id,
      permissionType: PermissionType.Edit,
    });

    for (const perm of editPermissions) {
      // If permission is inherited and there's a parent tweet, check parent permissions
      if (perm.inherit && tweet.parentTweetId) {
        const parentCanEdit = await this.canEditTweet(
          userId,
          tweet.parentTweetId.toString(),
        );
        if (parentCanEdit) {
          return true;
        }
      } else {
        // Check if the user is directly allowed to edit the tweet
        if (perm.userIds.map((id) => id.toString()).includes(userId)) {
          return true;
        }
        // Check if the user's group is allowed to edit the tweet
        if (
          perm.groupIds.some((groupId) =>
            userGroupIds.includes(groupId.toString()),
          )
        ) {
          return true;
        }
      }
    }

    // If no conditions are met, the user cannot edit the tweet
    return false;
  }
}
