import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schema/users.schema';
import { UserRepository } from './users.repository';
import { UsersService } from './users.service';
import { S3Module } from 'src/s3/s3.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    S3Module,
  ],
  providers: [UsersService, UserRepository],
  exports: [UsersService],
})
export class UsersModule {}
