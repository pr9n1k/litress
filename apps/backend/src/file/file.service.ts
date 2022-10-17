import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import * as uuid from 'uuid';

const filePath = path.resolve(__dirname, '..', '..', '..', 'static');
@Injectable()
export class FileService {
  async createFile(file): Promise<string> {
    try {
      if (!file) {
        return '';
      }
      const fileExtension = file.originalname.split('.').pop();
      const fileName = uuid.v4() + '.' + fileExtension;
      const fullPath = path.join(filePath, fileName);
      await fs.promises.mkdir(filePath, { recursive: true });
      fs.writeFile(
        fullPath,
        Buffer.from(file.buffer),
        { encoding: 'binary' },
        function (e) {
          if (e) {
            throw e;
          }
        }
      );
      return fileName;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  removeFile(fileName: string) {
    try {
      if (!fileName) return '';
      fs.unlink(path.join(filePath, fileName), (err) => {
        if (err) throw err;
      });
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
