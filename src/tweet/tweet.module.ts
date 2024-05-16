import { GroupMembership } from '@/entities/group-membership.entity';
import { Group } from '@/entities/group.entity';
import { TweetPermission } from '@/entities/tweet-permisison.entity';
import { Tweet } from '@/entities/tweet.entity';
import { User } from '@/entities/user.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TweetResolver } from './tweet.resolver';
import { TweetService } from './tweet.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Tweet,
      TweetPermission,
      User,
      Group,
      GroupMembership,
    ]),
  ],
  providers: [TweetService, TweetResolver],
  exports: [TweetService],
})
export class TweetModule {}
