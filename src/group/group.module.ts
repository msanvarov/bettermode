import { GroupMembership } from '@/entities/group-membership.entity';
import { Group } from '@/entities/group.entity';
import { User } from '@/entities/user.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupResolver } from './group.resolver';
import { GroupService } from './group.service';

@Module({
  imports: [TypeOrmModule.forFeature([Group, User, GroupMembership])],
  providers: [GroupService, GroupResolver],
  exports: [GroupService],
})
export class GroupModule {}
