import { Injectable } from '@nestjs/common';

@Injectable()
export class UploadsService {
    upload(file: Express.Multer.File) {
        return {
            filename: file.filename,
            originalName: file.originalname,
            size: file.size,
            mimeType: file.mimetype,
            path: file.path,
            url: `/uploads/temp/${file.filename}`,
        };
    }
}