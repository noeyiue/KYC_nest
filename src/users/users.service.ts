import { Injectable } from '@nestjs/common';
import { UserRepository } from './users.repository';
import { v4 as uuidv4 } from 'uuid';
import { User } from './schema/users.schema';
import { S3Service } from 'src/s3/s3.service';
import { encryptData } from 'src/utils/encrypt';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private s3Service: S3Service,
  ) {}

  async findOne(username: string): Promise<User | undefined> {
    return this.userRepository.findOne({ username });
  }

  async findOneByEmailorPhone(
    email: string,
    phone: string,
  ): Promise<User | undefined> {
    return this.userRepository.findOneByEmailorPhone(email, phone);
  }

  async createUser(
    username: string,
    password: string,
    th_firstname: string,
    th_lastname: string,
    en_firstname: string,
    en_lastname: string,
    id_num: string,
    email: string,
    phone: string,
  ): Promise<User> {
    console.log(en_firstname)
    return this.userRepository.create({
      userId: uuidv4(),
      username: username,
      password: password,
      th_firstname: th_firstname,
      th_lastname: th_lastname,
      en_firstname: en_firstname,
      en_lastname: en_lastname,
      id_num: encryptData(id_num),
      laser_code: null,
      email: email,
      phone: phone,
    });
  }

  async addImageToUser(file: Express.Multer.File, userId: string) {
    const key = `${file.fieldname}${Date.now()}`;
    const imageUrl = await this.s3Service.uploadFile(file, key);

    return this.userRepository.findOneAndUpdate(userId, imageUrl);
  }
}
