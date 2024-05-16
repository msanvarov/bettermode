/* eslint-disable @typescript-eslint/no-unused-vars */
import { Tweet } from '@/entities/tweet.entity';
import {
  CreateTweetInput,
  PaginatedTweet,
  UpdateTweetPermissionsInput,
} from '@/graphql';
import {
  Args,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from '@nestjs/graphql';
import { TweetService } from './tweet.service';

@ObjectType()
export class PaginatedTweetModel {
  @Field((type) => [Tweet], {
    description: 'A list of tweets that are viewable by the user',
  })
  nodes: Tweet[];

  @Field({
    description:
      'Indicates whether or not the pagination has more results to show. If true, next page is available',
  })
  hasNextPage: boolean;
}

@Resolver((of) => Tweet)
export class TweetResolver {
  constructor(private readonly tweetService: TweetService) {}

  @Query((returns) => PaginatedTweetModel, {
    description:
      "Paginates over tweets for the given user ID\nThis API only retrieves those tweets that are viewable for the given user ID\nTweets order should be based on 'createdAt' field. Latest tweets should be on top of the list.",
  })
  async paginateTweets(
    @Args('userId') userId: string,
    @Args('limit') limit: number,
    @Args('page') page: number,
  ): Promise<PaginatedTweet> {
    return this.tweetService.paginateTweets(userId, limit, page);
  }

  @Query((returns) => Boolean, {
    description:
      'Returns true if the given user ID can edit the given tweet ID',
  })
  async canEditTweet(
    @Args('userId') userId: string,
    @Args('tweetId') tweetId: string,
  ): Promise<boolean> {
    return this.tweetService.canEditTweet(userId, tweetId);
  }

  @Mutation((returns) => Tweet)
  async createTweet(@Args('input') input: CreateTweetInput): Promise<Tweet> {
    return this.tweetService.createTweet(
      input.authorId,
      input.content,
      input.parentTweetId,
      input.category,
      input.location,
    );
  }

  @Mutation((returns) => Boolean)
  async updateTweetPermissions(
    @Args('input') input: UpdateTweetPermissionsInput,
  ): Promise<boolean> {
    return this.tweetService.updateTweetPermissions(
      input.tweetId,
      input.inheritViewPermissions,
      input.inheritEditPermissions,
      input.viewPermissions,
      input.editPermissions,
    );
  }
}
