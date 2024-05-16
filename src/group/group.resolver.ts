/* eslint-disable @typescript-eslint/no-unused-vars */
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { Group } from '@/entities/group.entity';
import { CreateGroupInput } from '@/graphql';
import { GroupService } from './group.service';

@Resolver((of) => Group)
export class GroupResolver {
  constructor(private readonly groupService: GroupService) {}

  @Mutation((returns) => Group)
  async createGroup(
    @Args('creatorId') creatorId: string,
    @Args('name') name: string,
    @Args('input') input: CreateGroupInput,
  ): Promise<Group> {
    return this.groupService.createGroup(
      creatorId,
      name,
      input.userIds,
      input.groupIds,
    );
  }
}
