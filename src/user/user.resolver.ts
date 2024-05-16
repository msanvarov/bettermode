/* eslint-disable @typescript-eslint/no-unused-vars */
import { User } from '@/entities/user.entity';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';

@Resolver((of) => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation((returns) => User)
  async createUser(
    @Args('username') username: string,
    @Args('email') email: string,
  ): Promise<User> {
    const user = await this.userService.findUserByEmail(email);
    if (user) {
      throw new Error('User exists');
    }
    return this.userService.createUser(username, email);
  }

  @Query((returns) => User, { nullable: true })
  async user(@Args('id') id: string): Promise<User | undefined> {
    const user = await this.userService.findUserById(id);
    if (!user) {
      throw new Error('User not found');
    }
    return {
      ...user,
      tweets: user.tweets ?? [],
      groups: user.groups ?? [],
    };
  }
}
