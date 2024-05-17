import { PermissionType } from '@/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TweetPermissionDocument = TweetPermissionEntity & Document;

@Schema()
export class TweetPermissionEntity {
  @Prop({ type: Types.ObjectId, ref: 'Tweet', required: true })
  tweet: Types.ObjectId;

  @Prop({ enum: PermissionType, required: true })
  permissionType: PermissionType;

  @Prop()
  inherit: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Group' })
  group: Types.ObjectId;
}

export const TweetPermissionSchema = SchemaFactory.createForClass(
  TweetPermissionEntity,
);
