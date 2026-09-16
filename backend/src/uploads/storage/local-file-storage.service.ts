import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import {
    createReadStream,
    promises as fs,
} from 'fs';

import {
    join,
    resolve,
    sep,
} from 'path';

@Injectable()
export class LocalFileStorageService {
    private readonly storageRoot =
        resolve(
            process.env.FILES_LOCAL_PATH ??
                './uploads',
        );

    async moveFromTemp(
        file: Express.Multer.File,
        directory: string,
    ) {
        const filename =
            file.filename;

        const targetDirectory =
            join(
                this.storageRoot,
                directory,
            );

        await fs.mkdir(
            targetDirectory,
            {
                recursive: true,
            },
        );

        const sourcePath =
            resolve(file.path);

        const targetPath =
            join(
                targetDirectory,
                filename,
            );

        await fs.rename(
            sourcePath,
            targetPath,
        );

        return {
            filename,
            path: join(
                directory,
                filename,
            ),
        };
    }

    async getFile(
        relativePath: string,
    ) {
        const filePath =
            this.resolvePath(
                relativePath,
            );

        try {
            await fs.access(
                filePath,
            );
        } catch {
            throw new NotFoundException(
                'File not found.',
            );
        }

        return {
            stream: createReadStream(
                filePath,
            ),
            path: filePath,
        };
    }

    async delete(
        relativePath: string,
    ) {
        const filePath =
            this.resolvePath(
                relativePath,
            );

        try {
            await fs.unlink(
                filePath,
            );
        } catch (error: any) {
            if (
                error?.code !==
                'ENOENT'
            ) {
                throw error;
            }
        }
    }

    private resolvePath(
        relativePath: string,
    ) {
        const normalised =
            relativePath
                .replace(/\\/g, '/')
                .replace(/^\/+/, '');

        const filePath =
            resolve(
                join(
                    this.storageRoot,
                    normalised,
                ),
            );

        if (
            filePath !==
                this.storageRoot &&
            !filePath.startsWith(
                `${this.storageRoot}${sep}`,
            )
        ) {
            throw new NotFoundException(
                'File not found.',
            );
        }

        return filePath;
    }
}