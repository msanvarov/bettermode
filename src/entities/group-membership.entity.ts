import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Group } from './group.entity';
import { User } from './user.entity';

@Entity()
export class GroupMembership {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Group, (group) => group.memberships)
  @JoinColumn({ name: 'group_id' })
  group: Group;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Group, { nullable: true })
  @JoinColumn({ name: 'subgroup_id' })
  subgroup: Group;
}
