import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GroupMembership } from './group-membership.entity';
import { User } from './user.entity';

@Entity()
export class Group {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => User, (user) => user.groups)
  creator: User;

  @OneToMany(() => GroupMembership, (membership) => membership.group)
  memberships: GroupMembership[];
}
