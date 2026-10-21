import { PartialType } from '@nestjs/swagger';
import { AdminCreateFloristDto } from './admin-create-florist.dto';



export class AdminUpdateFloristDto extends PartialType(AdminCreateFloristDto) {}