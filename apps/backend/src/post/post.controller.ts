import { PostService } from './post.service';
import {
  Body,
  Controller,
  Post,
  UseInterceptors,
  Headers,
  UploadedFile,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('post')
export class PostController {
  constructor(private service: PostService) {}

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Post()
  create(
    @Headers('Authorization') token: string,
    @Body() dto: { title: string; text: string },
    @UploadedFile() file
  ) {
    return this.service.create(token, dto, file);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  get(@Query() query: { limit?: string; page?: string }) {
    return this.service.get(query);
  }
}
