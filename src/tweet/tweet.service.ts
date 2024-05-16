import { GroupMembership } from '@/entities/group-membership.entity';
import { Group } from '@/entities/group.entity';
import { TweetPermission } from '@/entities/tweet-permisison.entity';
import { Tweet } from '@/entities/tweet.entity';
import { User } from '@/entities/user.entity';
import { PermissionType, TweetCategory } from '@/graphql';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class TweetService {
  constructor(
    @InjectRepository(Tweet)
    private tweetRepository: Repository<Tweet>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(TweetPermission)
    private permissionRepository: Repository<TweetPermission>,
    @InjectRepository(Group)
    private groupRepository: Repository<Group>,
    @InjectRepository(GroupMembership)
    private groupMembershipRepository: Repository<GroupMembership>,
  ) {}

  async createTweet(
    authorId: string,
    content: string,
    parentTweetId?: string,
    category?: string,
    location?: string,
  ): Promise<Tweet> {
    const author = await this.userRepository.findOne({
      where: {
        id: authorId,
      },
    });
    if (!author) throw new Error('Author not found');
    let tweetCategory: TweetCategory | undefined;
    if (
      category &&
      Object.values(TweetCategory).includes(category as TweetCategory)
    ) {
      tweetCategory = category as TweetCategory;
    } else if (category) {
      // If the category is provided but invalid, throw an error or handle it as needed
      throw new Error(`Invalid category: ${category}`);
    }

    const tweet = this.tweetRepository.create({
      author,
      content,
      parentTweetId,
      category: tweetCategory,
      location,
      createdAt: new Date(),
    });

    await this.tweetRepository.save(tweet);
    return tweet;
  }

  async updateTweetPermissions(
    tweetId: string,
    inheritViewPermissions: boolean,
    inheritEditPermissions: boolean,
    viewPermissions: string[],
    editPermissions: string[],
  ): Promise<boolean> {
    const tweet = await this.tweetRepository.findOne({
      where: {
        id: tweetId,
      },
    });
    if (!tweet) throw new Error('Tweet not found');

    // Clear existing permissions
    await this.permissionRepository.delete({
      tweet,
      permissionType: PermissionType.View,
    });
    await this.permissionRepository.delete({
      tweet,
      permissionType: PermissionType.Edit,
    });

    if (!inheritViewPermissions) {
      for (const permissionId of viewPermissions) {
        const group = await this.groupRepository.findOne({
          where: {
            id: permissionId,
          },
        });
        if (group) {
          const permission = this.permissionRepository.create({
            tweet,
            permissionType: PermissionType.View,
            inherit: false,
            group,
          });
          await this.permissionRepository.save(permission);
        }
      }
    }

    if (!inheritEditPermissions) {
      for (const permissionId of editPermissions) {
        const group = await this.groupRepository.findOne({
          where: {
            id: permissionId,
          },
        });
        if (group) {
          const permission = this.permissionRepository.create({
            tweet,
            permissionType: PermissionType.Edit,
            inherit: false,
            group,
          });
          await this.permissionRepository.save(permission);
        }
      }
    }

    return true;
  }

  async paginateTweets(userId: string, limit: number, page: number) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });
    if (!user) throw new Error('User not found');

    const userGroupIds = await this.groupMembershipRepository
      .createQueryBuilder('membership')
      .where('membership.user_id = :userId', { userId })
      .select('membership.group_id')
      .getRawMany();

    const groupIds = userGroupIds.map((g) => g.group_id);

    const queryBuilder = this.tweetRepository
      .createQueryBuilder('tweet')
      .leftJoinAndSelect('tweet.permissions', 'permission')
      .leftJoinAndSelect('permission.group', 'group')
      .where('permission.permissionType = :permissionType', {
        permissionType: PermissionType.View,
      })
      .andWhere(
        '(permission.group_id IN (:...groupIds) OR permission.group_id IS NULL)',
        { groupIds },
      )
      .orderBy('tweet.createdAt', 'DESC')
      .skip(limit * (page - 1))
      .take(limit);

    const tweets = await queryBuilder.getMany();
    const total = await queryBuilder.getCount();
    const hasNextPage = total > limit * page;

    return {
      nodes: tweets,
      hasNextPage,
    };
  }

  async canEditTweet(userId: string, tweetId: string): Promise<boolean> {
    const userGroupIds = await this.groupMembershipRepository
      .createQueryBuilder('membership')
      .where('membership.user_id = :userId', { userId })
      .select('membership.group_id')
      .getRawMany();

    const groupIds = userGroupIds.map((g) => g.group_id);

    const permission = await this.permissionRepository
      .createQueryBuilder('permission')
      .where('permission.tweet_id = :tweetId', { tweetId })
      .andWhere('permission.permissionType = :permissionType', {
        permissionType: PermissionType.Edit,
      })
      .andWhere(
        '(permission.group_id IN (:...groupIds) OR permission.group_id IS NULL)',
        { groupIds },
      )
      .getOne();

    return !!permission;
  }
}
