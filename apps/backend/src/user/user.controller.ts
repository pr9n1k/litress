import { UserService } from './user.service';
import {
  Body,
  Controller,
  Get,
  Headers,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private service: UserService) {}

  @Get('')
  getMe(@Headers('Authorization') token: string) {
    return this.service.getMe(token);
  }

  @Patch('name')
  updateName(
    @Headers('Authorization') token: string,
    @Body() dto: { name: string }
  ) {
    return this.service.updateName(token, dto);
  }

  @UseInterceptors(FileInterceptor('file'))
  @Patch('picture')
  updatePicture(@Headers('Authorization') token: string, @UploadedFile() file) {
    return this.service.updatePicture(token, file);
  }

  @Post('link')
  createLink(
    @Headers('Authorization') token: string,
    @Body() dto: { title: string; value: string }
  ) {
    return this.service.createLink(token, dto);
  }
}
