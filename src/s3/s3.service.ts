import { Injectable, Logger } from '@nestjs/common';
import {
  PutObjectCommand,
  PutObjectCommandInput,
  PutObjectCommandOutput,
  S3Client,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Service {
  private logger = new Logger(S3Service.name);
  private region: string;
  private s3: S3Client;

  constructor(private configService: ConfigService) {
    this.region =
      this.configService.get<string>('S3_REGION') || 'ap-southeast-1';
    this.s3 = new S3Client({
      region: this.region,
      credentials: {
        secretAccessKey: process.env.S3_SECRET_ACESS_KEY,
        accessKeyId: process.env.S3_ACESS_KEY_ID,
      },
    });
  }

  async uploadFile(file: Express.Multer.File, key: string) {
    const bucket = process.env.S3_BUCKET;
    const input: PutObjectCommandInput = {
      Body: file.buffer,
      Bucket: process.env.S3_BUCKET,
      Key: key,
      ContentType: file.mimetype,
    };
    try {
      const response: PutObjectCommandOutput = await this.s3.send(
        new PutObjectCommand(input),
      );
      if (response.$metadata.httpStatusCode === 200) {
        return `https://${bucket}.s3.${this.region}.amazonaws.com/${key}`;
      }
      throw new Error('Image not saved to S3');
    } catch (err) {
      this.logger.error('Cannot save file inside s3', err);
      throw err;
    }
  }
}
