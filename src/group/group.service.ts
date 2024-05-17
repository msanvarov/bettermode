import { GroupDocument, GroupEntity } from '@/entities/group.entity';
import { UserDocument, UserEntity } from '@/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class GroupService {
  constructor(
    @InjectModel(GroupEntity.name) private groupModel: Model<GroupDocument>,
    @InjectModel(UserEntity.name) private userModel: Model<UserDocument>,
  ) {}

  async createGroup(
    creatorId: string,
    userIds: string[],
    groupIds: string[],
  ): Promise<GroupEntity> {
    // Ensure the creator exists
    const creator = await this.userModel.findById(creatorId);
    if (!creator) {
      throw new Error('Creator user not found');
    }

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
}
