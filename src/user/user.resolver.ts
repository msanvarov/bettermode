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
    if (this.userService.findUserByEmail(email)) {
      throw new Error('User exists');
    }
    return this.userService.createUser(username, email);
  }

  @Query((returns) => User, { nullable: true })
  async user(@Args('id') id: string): Promise<User | undefined> {
    return this.userService.findUserById(id);
  }
}
