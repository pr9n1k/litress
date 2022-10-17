import { AuthService } from './auth.service';
import { Response, Request } from 'express';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private service: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() dto: { login: string; password: string },
    @Res({ passthrough: true }) response: Response
  ) {
    const data = await this.service.login(dto);
    response.cookie('refreshToken', data.refresh_token, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    return data;
  }

  @HttpCode(HttpStatus.OK)
  @Post('registration')
  async registration(
    @Body() dto: { login: string; password: string },
    @Res({ passthrough: true }) response: Response
  ) {
    const data = await this.service.registration(dto);
    response.cookie('refreshToken', data.refresh_token, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    return data;
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ) {
    const refreshToken = request.cookies['refreshToken'];
    const token = await this.service.logout(refreshToken);
    response.clearCookie('refreshToken');
    return token;
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(@Req() request: Request, @Res() response: Response) {
    const refreshToken = request.cookies['refreshToken'];
    const data = await this.service.refresh(refreshToken);
    response.cookie('refreshToken', data.refresh_token, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    return response.json(data);
  }
}
