import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Group } from './group.entity';
import { Tweet } from './tweet.entity';

export enum PermissionType {
  View = 'View',
  Edit = 'Edit',
}

@Entity()
export class TweetPermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Tweet, (tweet) => tweet.permissions)
  @JoinColumn({ name: 'tweet_id' })
  tweet: Tweet;

  @Column({
    type: 'enum',
    enum: PermissionType,
  })
  permissionType: PermissionType;

  @Column()
  inherit: boolean;

  @ManyToOne(() => Group, { nullable: true })
  @JoinColumn({ name: 'group_id' })
  group: Group;
}
