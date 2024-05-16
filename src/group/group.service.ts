import { GroupMembership } from '@/entities/group-membership.entity';
import { Group } from '@/entities/group.entity';
import { User } from '@/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private groupRepository: Repository<Group>,
    @InjectRepository(GroupMembership)
    private membershipRepository: Repository<GroupMembership>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createGroup(
    creatorId: string,
    name: string,
    userIds: string[],
    groupIds: string[],
  ): Promise<Group> {
    const creator = await this.userRepository.findOne({
      where: { id: creatorId },
    });
    if (!creator) throw new Error('Creator not found');

    const group = this.groupRepository.create({ creator, name });
    await this.groupRepository.save(group);

    for (const userId of userIds) {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });
      if (user) {
        const membership = this.membershipRepository.create({ group, user });
        await this.membershipRepository.save(membership);
      }
    }

    for (const groupId of groupIds) {
      const subgroup = await this.groupRepository.findOne({
        where: { id: groupId },
      });
      if (subgroup) {
        const membership = this.membershipRepository.create({
          group,
          subgroup,
        });
        await this.membershipRepository.save(membership);
      }
    }

    return group;
  }
}
