import {
  Controller,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Headers,
  UnauthorizedException,
  Req,
} from '@nestjs/common';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { ApiBody, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Address } from './entities/address.entity';
import { RolesGuard } from 'src/decorator/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { RequestUser } from 'src/interface/common.interface';

@ApiTags('Address')
@ApiBearerAuth('jwt')
@Controller('addresses')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post()
  @ApiBody({
    type: CreateAddressDto,
  })
  async create(
    @Body() createAddressDto: CreateAddressDto,
    @Req() req: RequestUser,
  ) {
    if (!req.user) {
      throw new UnauthorizedException('Access denied');
    }

    const userId = req.user.sub.toString();

    const address = await this.addressService.create(createAddressDto, userId);

    return { address };
  }

  @Put('/user/:userId')
  @ApiBody({
    type: Address,
  })
  async updateAddressByUserId(
    @Param('userId') userId: string,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    return this.addressService.updateByUserId(userId, updateAddressDto);
  }

  @Delete('/user/:userId/:addressId')
  async deleteAddressByUserId(
    @Param('userId') userId: string,
    @Param('addressId') addressId: string,
  ) {
    return this.addressService.deleteByUserId(userId, addressId);
  }
}
