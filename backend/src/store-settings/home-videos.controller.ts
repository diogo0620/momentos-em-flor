import { BadRequestException, Controller, Delete, Get, Param, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { randomUUID } from 'crypto';
import { UserRole } from '@prisma/client';
import { SupabaseStorageService } from '@/storage/supabase-storage.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';

@Controller('home-videos')
export class HomeVideosController {
    constructor(private readonly storage: SupabaseStorageService) {}
    @Get()
    async list() { return { data: await this.storage.listHomeVideos() }; }
    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SYSTEM_ADMIN)
    @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 30 * 1024 * 1024 } }))
    async upload(@UploadedFile() file?: Express.Multer.File) {
        if (!file || !['video/mp4', 'video/webm'].includes(file.mimetype)) throw new BadRequestException('Seleciona um vídeo MP4 ou WebM até 30 MB.');
        const mp4 = file.buffer.subarray(4, 8).toString() === 'ftyp';
        const webm = file.buffer.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]));
        if (!(file.mimetype === 'video/mp4' ? mp4 : webm)) throw new BadRequestException('O conteúdo não corresponde ao formato do vídeo.');
        const name = `${Date.now()}-${randomUUID()}.${mp4 ? 'mp4' : 'webm'}`;
        await this.storage.upload(`home-videos/${name}`, file.buffer, file.mimetype);
        return { data: { name, url: this.storage.getPublicUrl(`home-videos/${name}`) } };
    }
    @Delete(':name')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SYSTEM_ADMIN)
    async remove(@Param('name') name: string) {
        if (!/^\d+-[a-f0-9-]+\.(mp4|webm)$/.test(name)) throw new BadRequestException('Nome de vídeo inválido.');
        await this.storage.remove(`home-videos/${name}`);
        return { data: { removed: true } };
    }
}
