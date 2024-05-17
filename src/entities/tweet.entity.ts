import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { TweetCategory } from '../graphql';

export type TweetDocument = TweetEntity & Document;

@Schema({ timestamps: true })
export class TweetEntity {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  authorId: Types.ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop({ type: [String], required: true })
  hashtags: string[];

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
