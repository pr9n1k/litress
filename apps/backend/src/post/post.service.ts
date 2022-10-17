import { FileService } from './../file/file.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class PostService {
  constructor(
    private prisma: PrismaService,
    private fileService: FileService,
    private jwt: JwtService
  ) {}

  async create(token: string, dto: { title: string; text: string }, file) {
    const access_token = token.split(' ')[1];
    const user = this.jwt.decode(access_token);
    if (!user) {
      throw new HttpException(`Токен не валидный`, HttpStatus.BAD_REQUEST);
    }
    const picture = await this.fileService.createFile(file);
    return this.prisma.post.create({
      data: {
        text: dto.text,
        title: dto.title,
        picture,
        userId: user['sub'],
      },
    });
  }

  get(query?: { limit?: string; page?: string }) {
    const page = !isNaN(parseInt(query.page)) ? parseInt(query.page) : 1;
    const take = !isNaN(parseInt(query.limit)) ? parseInt(query.limit) : 8;

    const skip = page * take - take;
    return this.prisma.post.findMany({ skip, take });
  }
}
