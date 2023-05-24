import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Kyc, KycSchema } from './schema/kycs.schema';
import { S3Module } from 'src/s3/s3.module';
import { KycsService } from './kycs.service';
import { KycsController } from './kycs.controller';
import { KycRepository } from './kycs.repository';
import { UsersModule } from 'src/users/users.module';
import { User, UserSchema } from 'src/users/schema/users.schema';



@Module({
    imports: [
        MongooseModule.forFeature([{ name: Kyc.name, schema: KycSchema}]),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        S3Module
    ],
    providers: [KycsService, KycRepository],
    controllers: [KycsController],
    exports: [KycsService]
})
export class KycsModule {}
