import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Tweet } from './tweet.entity';
import { Group } from './group.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  username: string;

  @Column()
  email: string;

  @OneToMany(() => Tweet, (tweet) => tweet.author)
  tweets: Tweet[];

  @OneToMany(() => Group, (group) => group.creator)
  groups: Group[];
}