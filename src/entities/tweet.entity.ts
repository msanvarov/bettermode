import { TweetCategory } from '@/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TweetDocument = TweetEntity & Document;

@Schema({ timestamps: true })
export class TweetEntity {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  author: Types.ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop({ type: Types.ObjectId, ref: 'Tweet' })
  parentTweetId: Types.ObjectId;

  @Prop({ type: String, enum: TweetCategory })
  category: TweetCategory;

  @Prop()
  location: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const TweetSchema = SchemaFactory.createForClass(TweetEntity);
