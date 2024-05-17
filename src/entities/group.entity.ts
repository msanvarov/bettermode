import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type GroupDocument = GroupEntity & Document;

@Schema()
export class GroupEntity {
  @Prop({ required: true, type: [{ type: Types.ObjectId, ref: 'User' }] })
  userIds: Types.ObjectId[];

  @Prop({ required: true, type: [{ type: Types.ObjectId, ref: 'Group' }] })
  groupIds: Types.ObjectId[];
}

export const GroupSchema = SchemaFactory.createForClass(GroupEntity);
