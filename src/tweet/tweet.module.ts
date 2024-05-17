import { GroupEntity, GroupSchema } from '@/entities/group.entity';
import {
  TweetPermissionEntity,
  TweetPermissionSchema,
} from '@/entities/tweet-permission.entity';
import { TweetEntity, TweetSchema } from '@/entities/tweet.entity';
import { UserEntity, UserSchema } from '@/entities/user.entity';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TweetResolver } from './tweet.resolver';
import { TweetService } from './tweet.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TweetEntity.name, schema: TweetSchema },
      { name: TweetPermissionEntity.name, schema: TweetPermissionSchema },
      { name: UserEntity.name, schema: UserSchema },
      { name: GroupEntity.name, schema: GroupSchema },
    ]),
  ],
  providers: [TweetService, TweetResolver],
  exports: [TweetService],
})
export class TweetModule {}
