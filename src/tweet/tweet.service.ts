import { GroupDocument, GroupEntity } from '@/entities/group.entity';
import {
  TweetPermissionDocument,
  TweetPermissionEntity,
} from '@/entities/tweet-permission.entity';
import { TweetDocument, TweetEntity } from '@/entities/tweet.entity';
import { UserDocument, UserEntity } from '@/entities/user.entity';
import { PermissionType, TweetCategory } from '@/graphql';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

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
      author: author._id,
      content,
      parentTweetId,
      category,
      location,
      createdAt: new Date(),
    });

    await tweet.save();
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
        const permission = new this.permissionModel({
          tweet: tweet._id,
          permissionType: PermissionType.View,
          inherit: false,
          group: id,
        });
        await permission.save();
      }
    } else {
      const permission = new this.permissionModel({
        tweet: tweet._id,
        permissionType: PermissionType.View,
        inherit: true,
      });
      await permission.save();
    }

    // Update Edit Permissions
    if (!inheritEditPermissions) {
      for (const id of editPermissions) {
        const permission = new this.permissionModel({
          tweet: tweet._id,
          permissionType: PermissionType.Edit,
          inherit: false,
          group: id,
        });
        await permission.save();
      }
    } else {
      const permission = new this.permissionModel({
        tweet: tweet._id,
        permissionType: PermissionType.Edit,
        inherit: true,
      });
      await permission.save();
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
          from: 'tweetpermissions',
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
    const groups = await this.groupModel.find({ userIds: userId });
    const groupIds = groups.map((group) => group._id);

    const permission = await this.permissionModel.findOne({
      tweet: tweetId,
      permissionType: PermissionType.Edit,
      $or: [{ group: { $in: groupIds } }, { inherit: true }],
    });

    return !!permission;
  }
}
