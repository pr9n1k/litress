import { PrismaService } from 'nestjs-prisma';
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  async getUser(): Promise<User[]> {
    return await this.prisma.user.findMany();
  }

  async setUser(dto: { name: string }) {
    return await this.prisma.user.create({
      data: {
        name: dto.name,
      },
    });
  }
}
