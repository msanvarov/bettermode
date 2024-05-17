/* eslint-disable @typescript-eslint/no-unused-vars */
import { GroupEntity } from '@/entities/group.entity';
import { CreateGroupInput } from '@/graphql';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { GroupService } from './group.service';

@Resolver((of) => GroupEntity)
export class GroupResolver {
  constructor(private readonly groupService: GroupService) {}

  @Mutation((returns) => GroupEntity)
  async createGroup(
    @Args('creatorId') creatorId: string,
    @Args('input') input: CreateGroupInput,
  ): Promise<GroupEntity> {
    return this.groupService.createGroup(
      creatorId,
      input.userIds,
      input.groupIds,
    );
  }
}
