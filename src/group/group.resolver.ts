/* eslint-disable @typescript-eslint/no-unused-vars */
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { GroupEntity } from '../entities/group.entity';
import { CreateGroupInput } from '../graphql';
import { GroupService } from './group.service';

@Resolver((of) => GroupEntity)
export class GroupResolver {
  constructor(private readonly groupService: GroupService) {}

  @Mutation((returns) => GroupEntity)
  async createGroup(
    @Args('input') input: CreateGroupInput,
  ): Promise<GroupEntity> {
    return this.groupService.createGroup(input.userIds, input.groupIds);
  }
}
