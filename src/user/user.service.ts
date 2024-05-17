import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument, UserEntity } from '../entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(UserEntity.name) private userModel: Model<UserDocument>,
  ) {}

  async createUser(username: string, email: string): Promise<UserEntity> {
    const user = new this.userModel({ username, email });
    await user.save();
    return user;
  }

  async findOneById(id: string): Promise<UserEntity | null> {
    return this.userModel.findById(id).exec();
  }
}
