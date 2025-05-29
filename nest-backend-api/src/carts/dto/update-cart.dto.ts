import { PartialType } from '@nestjs/swagger';
import { CreateItemCartDto } from './create-cart.dto';

export class UpdateCartDto extends PartialType(CreateItemCartDto) {}
