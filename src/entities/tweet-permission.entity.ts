import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { PermissionType } from '../graphql';

export type TweetPermissionDocument = TweetPermissionEntity & Document;

@Schema()
export class TweetPermissionEntity {
  @Prop({ type: Types.ObjectId, ref: 'Tweet', required: true })
  tweet: Types.ObjectId;

  @Prop({ enum: PermissionType, required: true })
  permissionType: PermissionType;

  @Prop()
  inherit: boolean;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Group' }] })
  groupIds: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  userIds: Types.ObjectId[];
}

export const TweetPermissionSchema = SchemaFactory.createForClass(
  TweetPermissionEntity,
);
