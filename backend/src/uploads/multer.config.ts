import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';

export const multerConfig = {
  storage: diskStorage({
    destination: './uploads/temp',

    filename(req, file, callback) {
      const unique =
        Date.now() + '-' + Math.round(Math.random() * 1e9);

      callback(null, unique + extname(file.originalname));
    },
  }),

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter(
    req: any,
    file: Express.Multer.File,
    callback: Function,
  ) {
    const allowed = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ];

    if (!allowed.includes(file.mimetype)) {
      return callback(
        new BadRequestException(
          'Only JPEG, PNG and WEBP images are allowed.',
        ),
        false,
      );
    }

    callback(null, true);
  },
};