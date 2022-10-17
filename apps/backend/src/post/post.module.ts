import { JwtModule } from '@nestjs/jwt';
import { FileModule } from './../file/file.module';
import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [PostController],
  providers: [PostService],
  imports: [FileModule, JwtModule, AuthModule],
})
export class PostModule {}
