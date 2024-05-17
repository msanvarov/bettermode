import { GroupEntity, GroupSchema } from '@/entities/group.entity';
import { UserEntity, UserSchema } from '@/entities/user.entity';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GroupResolver } from './group.resolver';
import { GroupService } from './group.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GroupEntity.name, schema: GroupSchema },
      { name: UserEntity.name, schema: UserSchema },
    ]),
  ],
  providers: [GroupService, GroupResolver],
  exports: [GroupService],
})
export class GroupModule {}
