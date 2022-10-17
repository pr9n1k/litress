import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'nestjs-prisma';
import { AuthService } from '../auth/auth.service';
import { FileService } from '../file/file.service';

@Injectable()
export class UserService {
  constructor(
    private fileService: FileService,
    private prisma: PrismaService,
    private jwt: JwtService,
    @Inject(forwardRef(() => AuthService))
    private auth: AuthService
  ) {}

  async create(dto: { login: string; password: string }) {
    const candidateForEmail = await this.prisma.user.findUnique({
      where: { login: dto.login },
    });
    if (candidateForEmail) {
      throw new HttpException(
        `Аккаунт с таким email ${dto.login} уже зарегистрирован`,
        HttpStatus.BAD_REQUEST
      );
    }
    const user = await this.prisma.user.create({
      data: {
        ...dto,
      },
    });
    return user;
  }

  async getMe(token: string) {
    const access_token = token.split(' ')[1];
    const decode = this.jwt.decode(access_token);
    if (!decode) {
      throw new HttpException(`Токен не валидный`, HttpStatus.BAD_REQUEST);
    }
    const user = await this.prisma.user.findUnique({
      where: {
        login: decode['login'],
      },
    });
    delete user.password;
    const links = await this.prisma.link.findMany({
      where: {
        userId: user.id,
      },
    });
    return { ...user, links };
  }
  async updateName(token: string, dto: { name: string }) {
    const access_token = token.split(' ')[1];
    const user = this.jwt.decode(access_token);
    if (!user) {
      throw new HttpException(`Токен не валидный`, HttpStatus.BAD_REQUEST);
    }
    await this.prisma.user.update({
      where: {
        id: user['sub'],
      },
      data: {
        name: dto.name,
      },
    });
    return { message: 'Имя обновлено' };
  }

  async updatePicture(token: string, file) {
    const access_token = token.split(' ')[1];
    const user = this.jwt.decode(access_token);
    if (!user) {
      throw new HttpException(`Токен не валидный`, HttpStatus.BAD_REQUEST);
    }
    const picture = await this.fileService.createFile(file);
    await this.prisma.user.update({
      where: { id: user['sub'] },
      data: {
        picture,
      },
    });
    return { message: 'Фото обновлено' };
  }

  async createLink(token: string, dto: { title: string; value: string }) {
    const access_token = token.split(' ')[1];
    const user = this.jwt.decode(access_token);
    if (!user) {
      throw new HttpException(`Токен не валидный`, HttpStatus.BAD_REQUEST);
    }
    return await this.prisma.link.create({
      data: {
        userId: user['sub'],
        title: dto.title,
        value: dto.value,
      },
    });
  }
}
