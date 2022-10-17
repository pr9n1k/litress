import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { JwtService } from '@nestjs/jwt';
import * as argon from 'argon2';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private user: UserService
  ) {}

  async login(dto: { login: string; password: string }) {
    const user = await this.prisma.user.findUnique({
      where: {
        login: dto.login,
      },
    });
    if (!user) {
      throw new HttpException(`Логин не верный`, HttpStatus.BAD_REQUEST);
    }
    const pwMatches = await argon.verify(user.password, dto.password);
    if (!pwMatches) {
      throw new HttpException(`Пароль не верный`, HttpStatus.BAD_REQUEST);
    }
    const tokens = await this.signToken(user.id, user.login);
    return { ...tokens };
  }
  async registration(dto: { login: string; password: string }) {
    const hash = await argon.hash(dto.password);
    try {
      const user = await this.user.create({ login: dto.login, password: hash });
      const tokens = await this.signToken(user.id, user.login);
      return { ...tokens };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }
      throw error;
    }
  }
  async logout(token: string) {
    try {
      await this.prisma.token.deleteMany({
        where: {
          refresh: token,
        },
      });
      return { message: 'Вы вышли из системы' };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }
      throw error;
    }
  }
  async signToken(userId: number, login: string) {
    const payload = {
      sub: userId,
      login,
    };
    const access_token = await this.jwt.signAsync(payload, {
      expiresIn: this.config.get('JWT_ACCESS_SECRET_EXPIRES_IN'),
      secret: this.config.get('JWT_ACCESS_SECRET'),
    });
    const refresh_token = await this.jwt.signAsync(payload, {
      expiresIn: this.config.get('JWT_REFRESH_SECRET_EXPIRES_IN'),
      secret: this.config.get('JWT_REFRESH_SECRET'),
    });
    this.saveRefreshToken(userId, refresh_token);
    return {
      access_token,
      refresh_token,
    };
  }
  // В будущем переписать для массива токенов
  async saveRefreshToken(userId: number, token: string) {
    const thisToken = await this.prisma.token.findFirst({
      where: {
        userId,
      },
    });
    if (!thisToken) {
      return await this.prisma.token.create({
        data: {
          refresh: token,
          userId,
        },
      });
    }
    const data = await this.prisma.token.update({
      where: {
        id: thisToken.id,
      },
      data: {
        refresh: token,
      },
    });
    return data;
  }
  async checkToken(refreshToken: string) {
    const refreshTokenVerify = await this.jwt.verifyAsync(refreshToken, {
      secret: this.config.get('JWT_REFRESH_SECRET'),
    });
    const login = refreshTokenVerify['login'];
    if (!login) {
      throw new ForbiddenException('Токен не валидный');
    }
    const user = await this.prisma.user.findUnique({
      where: { login },
    });
    if (!user) throw new ForbiddenException('Токен не валидный');
    return user;
  }
  async refresh(refreshToken: string) {
    try {
      if (!refreshToken) {
        throw new UnauthorizedException({
          message: 'Ошибка авторизации',
        });
      }

      const userData = await this.checkToken(refreshToken);
      const tokenFromDb = await this.prisma.token.findFirst({
        where: {
          refresh: refreshToken,
        },
      });
      if (!userData || !tokenFromDb) {
        throw new UnauthorizedException({
          message: 'Ошибка авторизации',
        });
      }

      return await this.signToken(userData.id, userData.login);
    } catch (error) {
      throw new HttpException('Токен устарел', HttpStatus.BAD_REQUEST);
    }
  }

  validateAccessToken(token: string): Promise<User> {
    try {
      const userData = this.jwt.verify(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });
      return userData;
    } catch (error) {
      return null;
    }
  }
}
