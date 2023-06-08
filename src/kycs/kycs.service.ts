import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { S3Service } from 'src/s3/s3.service';
import { KycRepository } from './kycs.repository';
import { v4 as uuidv4 } from 'uuid';

import axios from 'axios';
// import { AuthorDto } from './dto/authorization.dto';
import { decryptData, encryptData } from 'src/utils/encrypt';

@Injectable()
export class KycsService {
  constructor(
    private readonly kycRepository: KycRepository,
    private s3Service: S3Service,
  ) {}

  async check_valid_frontid(front_card: string, user: any) {
    const { th_firstname, th_lastname, en_firstname, en_lastname, id_num } =
      user;
    const encryptedData = Buffer.from(id_num, 'base64');
    try {
      const formData = {
        img: front_card,
        id_num: decryptData(encryptedData).toString(),
        th_fname: th_firstname,
        th_lname: th_lastname,
        en_fname: en_firstname,
        en_lname: en_lastname,
      };

      const response = await axios.post(
        `${process.env.FLASK_URL}/valid/front`,
        formData,
        {
          responseType: 'json',
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 300000,
        },
      );
      return response.data;
    } catch (error) {
      console.log(error.response.status);
      if (error.response.status === 501) {
        throw new HttpException('Cannot read data on picture', 501);
      }
      throw new HttpException('Problem with flask API', HttpStatus.BAD_REQUEST);
    }
  }

  async check_valid_backid(back_card: string) {
    try {
      const formData = {
        img: back_card,
      };
      const response = await axios.post(
        `${process.env.FLASK_URL}/valid/back`,
        formData,
        {
          responseType: 'json',
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      return response.data;
    } catch (error) {
      if (error.response.status === 501) {
        throw new HttpException('Cannot read data on picture', 501);
      } else {
        throw new HttpException(
          'Problem with flask API',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }

  async face_reg(face_img: string, userId: string) {
    const kyc = await this.kycRepository.findOneInKyc({ userId: userId });

    if (!kyc.picture_feats) {
      throw new HttpException(
        'Not vertify id card yet',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const formData = new FormData();
      formData.append('img', face_img);
      formData.append('feat', JSON.stringify(kyc.picture_feats));
      const response = await axios.post(
        `${process.env.FLASK_URL}/face_recognition`,
        formData,
        {
          responseType: 'json',
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      return response.data;
    } catch (error) {
      throw new HttpException('Problem with flask API', HttpStatus.BAD_REQUEST);
    }
  }

  async createKyc(userId: string) {
    return this.kycRepository.create({
      kycId: uuidv4(),
      userId: userId,
      front_image: null,
      back_image: null,
      face_image: null,
      picture_feats: null,
      kyc_result: false,
    });
  }

  async addFrontImage(file: Express.Multer.File, userId: string) {
    if (!userId || !file) {
      throw new HttpException('Missing data', HttpStatus.BAD_REQUEST);
    }
    const user = await this.kycRepository.findOneInUser({ userId });
    console.log(user);
    if (!user) {
      throw new HttpException(
        'UserId does not exisiting',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!(await this.kycRepository.findOneInKyc({ userId }))) {
      const newKyc = await this.createKyc(userId);
      if (!newKyc) {
        throw new HttpException(
          "Can't create new user",
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    const key = `${file.fieldname}${Date.now()}`;
    const imageUrl = await this.s3Service.uploadFile(file, key);
    const filename = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
    console.log(filename);
    const result = await this.check_valid_frontid(filename, user);
    if (result == 'error') {
      // Go to delete img in aws s3

      throw new HttpException(
        'Image not correct format',
        HttpStatus.BAD_REQUEST,
      );
    }
    const result1 = await this.kycRepository.findOneAndUpdateInKyc(
      userId,
      'picture_feats',
      result.feat,
    );
    if (!result1) {
      throw new HttpException("Can't update data", HttpStatus.BAD_REQUEST);
    }
    return await this.kycRepository.findOneAndUpdateInKyc(
      userId,
      'front_image',
      filename,
    );
  }

  async addBackImage(file: Express.Multer.File, userId: string) {
    if (!userId || !file) {
      throw new HttpException('Missing data', HttpStatus.BAD_REQUEST);
    }
    const user = await this.kycRepository.findOneInUser({ userId });
    if (!user) {
      throw new HttpException(
        'UserId does not exisiting',
        HttpStatus.BAD_REQUEST,
      );
    }
    const key = `${file.fieldname}${Date.now()}`;
    const imageUrl = await this.s3Service.uploadFile(file, key);
    const filename = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
    const result = await this.check_valid_backid(filename);
    if (result == 'error') {
      // Go to delete img in aws s3

      throw new HttpException(
        'Image not correct format',
        HttpStatus.BAD_REQUEST,
      );
    }
    const laser = result.laser_code;
    await this.kycRepository.findOneAndUpdateInUser(
      userId,
      'laser_code',
      encryptData(laser),
    );
    return await this.kycRepository.findOneAndUpdateInKyc(
      userId,
      'back_image',
      filename,
    );
  }

  async addFaceImage(file: Express.Multer.File, userId: string) {
    if (!userId || !file) {
      throw new HttpException('Missing data', HttpStatus.BAD_REQUEST);
    }
    const user = await this.kycRepository.findOneInUser({ userId });
    if (!user) {
      throw new HttpException(
        'UserId does not exisiting',
        HttpStatus.BAD_REQUEST,
      );
    }
    const key = `${file.fieldname}${Date.now()}`;
    const imageUrl = await this.s3Service.uploadFile(file, key);
    const filename = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
    const result = await this.face_reg(filename, userId);
    if (result.sims > 0.55) {
      await this.kycRepository.findOneAndUpdateInKyc(
        userId,
        'face_image',
        filename,
      );
      const result1 = await this.kycRepository.findOneAndUpdateInKyc(
        userId,
        'kyc_result',
        true,
      );
      return result1;
    } else {
      throw new HttpException("Face doesn't match", 500);
    }
  }

  async test(file: Express.Multer.File) {
    const imageUrl = await this.s3Service.uploadFileWithPresignedUrl(file);
    return { imageUrl };
  }

  async getHello() {
    try {
      const response = await axios.get(`${process.env.FLASK_URL}/`);
      return response.data;
    } catch (error) {
      throw new HttpException('Problem with flask API', HttpStatus.BAD_REQUEST);
    }
  }

  async encrypt(text: string) {
    console.log(text);
    const en = encryptData(text);
    console.log(en);
    const encryptedData = Buffer.from(en, 'base64');
    console.log(decryptData(encryptedData).toString());
    return en;
  }
}
