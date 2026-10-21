import {
    PartialType,
} from '@nestjs/swagger';
import { AdminCreateTaxCodeDto } from './admin-create-tax-code.dto';


export class AdminUpdateTaxCodeDto
    extends PartialType(AdminCreateTaxCodeDto) {
}