import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

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
}
