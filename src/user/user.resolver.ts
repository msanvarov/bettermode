/* eslint-disable @typescript-eslint/no-unused-vars */
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserEntity } from '../entities/user.entity';
import { UserService } from './user.service';

@Resolver((of) => UserEntity)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation((returns) => UserEntity)
  async createUser(
    @Args('username') username: string,
    @Args('email') email: string,
  ): Promise<UserEntity> {
    return this.userService.createUser(username, email);
  }

  @Query((returns) => UserEntity, { nullable: true })
  async user(@Args('id') id: string): Promise<UserEntity | null> {
    return this.userService.findOneById(id);
  }
}
