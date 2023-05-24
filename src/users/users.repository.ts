import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { User, UserDocument } from './schema/users.schema';

@Injectable()
export class UserRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findOne(userFilterQuery: FilterQuery<User>): Promise<User> {
    return this.userModel.findOne(userFilterQuery);
  }

  async findOneByEmailorPhone(email: string, phone: string): Promise<User> {
    return this.userModel.findOne({ $or: [{ email }, { phone }],});
  }

  async create(user: User): Promise<User> {
    const newUser = new this.userModel(user);
    return newUser.save();
  }

  async findOneAndUpdate(userId: string, imageUrl: string): Promise<User> {
    await this.userModel.findOneAndUpdate(
      { userId: userId },
      { image: imageUrl },
    );
    return this.findOne({ userId: userId });
  }
}
