import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TweetPermission } from './tweet-permisison.entity';
import { User } from './user.entity';

export enum TweetCategory {
  Sport = 'Sport',
  Finance = 'Finance',
  Tech = 'Tech',
  News = 'News',
}

@Entity()
export class Tweet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.tweets)
  author: User;

  @Column()
  content: string;

  @Column({ type: 'uuid', nullable: true })
  parentTweetId: string;

  @Column({ type: 'enum', enum: TweetCategory })
  category: TweetCategory;

  @Column()
  location: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => TweetPermission, (permission) => permission.tweet)
  permissions: TweetPermission[];
}
