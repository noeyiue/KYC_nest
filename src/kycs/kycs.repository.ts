import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { User, UserDocument } from 'src/users/schema/users.schema';
import { Kyc, KycDocument } from './schema/kycs.schema';
import { AuthorDto } from './dto/authorization.dto';

@Injectable()
export class KycRepository {
  constructor(
    @InjectModel(Kyc.name) private kycModel: Model<KycDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async findOneInUser(userFilterQuery: FilterQuery<User>): Promise<User> {
    return this.userModel.findOne(userFilterQuery);
  }

  async findOneInKyc(userFilterQuery: FilterQuery<Kyc>): Promise<Kyc> {
    return this.kycModel.findOne(userFilterQuery);
  }

  async create(kyc: Kyc): Promise<Kyc> {
    const newKyc = new this.kycModel(kyc);
    return newKyc.save();
  }

  async findOneAndUpdateDtoInUser(userId: string, authorDto: AuthorDto): Promise<User> {
    const { id_num, en_firstname, en_lastname } = authorDto;
    const updateQuery = {
        id_num,
        en_firstname,
        en_lastname,
      };
    await this.userModel.findOneAndUpdate(
      { userId: userId },
      updateQuery,
    );
    return this.findOneInUser({ userId: userId });
  }

  async findOneAndUpdateInUser(userId: string, updateField: string , fieldValue: string): Promise<User> {
    const updateQuery = { [updateField]: fieldValue };
    await this.userModel.findOneAndUpdate(
      { userId: userId },
      updateQuery,
    );
    return this.findOneInUser({ userId: userId });
  }

  async findOneAndUpdateInKyc(userId: string, updateField: string , fieldValue: any): Promise<Kyc> {
    const updateQuery = { [updateField]: fieldValue };
    await this.kycModel.findOneAndUpdate(
      { userId: userId },
      updateQuery,
    );
    return this.findOneInKyc({ userId: userId });
  }

}
