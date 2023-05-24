import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from './auth/auth.module';
import { S3Service } from './s3/s3.service';
import { S3Module } from './s3/s3.module';
import { KycsController } from './kycs/kycs.controller';
import { KycsModule } from './kycs/kycs.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.DATABASE_MONGO),
    UsersModule,
    PassportModule.register({ session: true }),
    AuthModule,
    S3Module,
    KycsModule,
  ],
  controllers: [AppController, KycsController],
  providers: [AppService, S3Service],
})
export class AppModule {}
