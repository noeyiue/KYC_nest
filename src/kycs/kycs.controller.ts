import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { KycsService } from './kycs.service';
import { AuthorDto } from './dto/authorization.dto';

@Controller('kycs')
export class KycsController {
  constructor(private kycsService: KycsService) {}

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Post('citizen-card/front')
  async addFrontImg(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() AuthorDto: AuthorDto,
  ) {
    const userId = req.user.userId;
    return await this.kycsService.addFrontImage(file, userId, AuthorDto);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Post('citizen-card/back')
  async addBackImg(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const userId = req.user.userId;
    return await this.kycsService.addBackImage(file, userId);
  }
  
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Post('face-img')
  async addFaceImg(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File
  ) {
    const userId = req.user.userId;
    return await this.kycsService.addFaceImage(file, userId);
  }

  @Post('encrypted')
  async encrypt() {
    return await this.kycsService.encrypt("Hello");
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    return await this.kycsService.test(file);
  }

  @Get('hello')
  async Hello() {
    return await this.kycsService.getHello();
  }
}

