import { BadRequestException, Body, Controller, Put, UseGuards } from '@nestjs/common';
import { IsIn, IsInt, Min } from 'class-validator';
import { UserRole } from '@prisma/client';
import { Roles } from '@/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { PrismaService } from '@/prisma/prisma.service';
import { MoloniApiService } from '../api/moloni-api.service';

class MappingDto {
    @IsIn(['customer', 'product', 'tax']) type!: 'customer' | 'product' | 'tax';
    @IsInt() @Min(1) localId!: number;
    @IsInt() @Min(1) moloniId!: number;
}

@Controller('admin/moloni/mappings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SYSTEM_ADMIN)
export class MoloniMappingsController {
    constructor(private readonly prisma: PrismaService, private readonly api: MoloniApiService) {}
    @Put()
    async update(@Body() dto: MappingDto) {
        const customer = dto.type === 'customer';
        const product = dto.type === 'product';
        const local = customer ? await this.prisma.user.findUnique({ where: { id: dto.localId } }) : product ? await this.prisma.product.findUnique({ where: { id: dto.localId } }) : await this.prisma.taxCode.findUnique({ where: { id: dto.localId } });
        if (!local) throw new BadRequestException('O registo local não existe.');
        const remote = customer ? await this.api.getCustomer<{ customer_id?: number }>(String(dto.moloniId)) : product ? await this.api.getProduct<{ product_id?: number }>(String(dto.moloniId)) : await this.api.getTax<{ tax_id?: number }>(String(dto.moloniId));
        const remoteId = customer ? (remote as { customer_id?: number }).customer_id : product ? (remote as { product_id?: number }).product_id : (remote as { tax_id?: number }).tax_id;
        if (Number(remoteId) !== dto.moloniId) throw new BadRequestException('O ID não corresponde a um registo da empresa Moloni configurada.');
        const data = { moloniId: String(dto.moloniId), status: 'SYNCED' as const, syncedAt: new Date(), message: null };
        if (customer) await this.prisma.moloniSync.upsert({ where: { userId: dto.localId }, create: { userId: dto.localId, ...data }, update: data });
        else if (product) await this.prisma.moloniSync.upsert({ where: { productId: dto.localId }, create: { productId: dto.localId, ...data }, update: data });
        else await this.prisma.moloniSync.upsert({ where: { taxCodeId: dto.localId }, create: { taxCodeId: dto.localId, ...data }, update: data });
        return { data: { saved: true } };
    }
}
