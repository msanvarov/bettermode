import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GroupDocument, GroupEntity } from '../entities/group.entity';
import { UserDocument, UserEntity } from '../entities/user.entity';

@Injectable()
export class GroupService {
  constructor(
    @InjectModel(GroupEntity.name) private groupModel: Model<GroupDocument>,
    @InjectModel(UserEntity.name) private userModel: Model<UserDocument>,
  ) {}

  async createGroup(
    userIds: string[],
    groupIds: string[],
  ): Promise<GroupEntity> {
    /*
    Create a group with the given userIds and groupIds
    Precondition: The first element of the userIds is the creator
    */
    // Ensure the creator exists
    if (!userIds.length) throw new Error('User IDs array cannot be empty');

    // Determine the creator based on your business logic, e.g., the first user in the list
    const creatorId = this.determineCreator(userIds);
    const creator = await this.userModel.findById(creatorId);
    if (!creator) throw new Error('Creator user not found');

    // Validate user IDs
    const validUserIds = await this.userModel.find({ _id: { $in: userIds } });
    if (validUserIds.length !== userIds.length) {
      throw new Error('One or more user IDs are invalid');
    }

    // Validate group IDs
    const validGroupIds = await this.groupModel.find({
      _id: { $in: groupIds },
    });
    if (validGroupIds.length !== groupIds.length) {
      throw new Error('One or more group IDs are invalid');
    }

    // Create the group
    const group = new this.groupModel({
      userIds: userIds,
      groupIds: groupIds,
    });

    await group.save();
    return group;
  }

  private determineCreator(userIds: string[]): string {
    // Logic: Pick the first user as the creator
    return userIds[0];
  }
}
