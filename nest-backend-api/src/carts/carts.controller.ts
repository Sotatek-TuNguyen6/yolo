import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UnauthorizedException,
  Put,
  BadRequestException,
} from '@nestjs/common';
import { CartsService } from './carts.service';
import { CreateItemCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { RolesGuard } from 'src/decorator/roles.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
// import { IItemCart } from 'src/interface/cart.interface';
import { RequestUser } from 'src/interface/common.interface';
import { CartItem } from './entities/cart.entity';

@ApiTags('Carts')
@Controller('carts')
@ApiBearerAuth('jwt')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @ApiBody({ type: CreateItemCartDto })
  @ApiOperation({ summary: 'Create a new cart item' })
  @ApiResponse({
    status: 201,
    description: 'Create a new cart item',
    type: CreateItemCartDto,
  })
  @Post()
  createCart(
    @Body() createItemCartDto: CreateItemCartDto,
    @Req() req: RequestUser,
  ) {
    if (!req.user) {
      throw new UnauthorizedException('Bạn cần đăng nhập để tạo giỏ hàng');
    }
    // createItemCartDto.user = req.user.sub;
    return this.cartsService.create({
      ...createItemCartDto,
      user: req.user.sub,
    });
  }

  @ApiOperation({ summary: 'Get all cart items' })
  @ApiResponse({
    status: 200,
    description: 'Get all cart items',
    type: [CreateItemCartDto],
  })
  @Get()
  findAll() {
    return this.cartsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cartsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCartDto: UpdateCartDto) {
    return this.cartsService.update(id, updateCartDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cartsService.remove(id);
  }

  @Put('/items-list/:cartId')
  async updateItemsCart(
    @Param('cartId') id: string,
    @Body() data: CartItem[],
    @Req() req: RequestUser,
  ) {
    if (!req.user) {
      throw new UnauthorizedException(
        'Bạn cần đăng nhập để cập nhập danh sách item',
      );
    }
    const cart = await this.cartsService.updateItems(
      id,
      req.user.sub.toString(),
      data,
    );
    return {
      message: 'Cập nhập danh sách item thành công',
      cart,
    };
  }

  @Put('/items/:cartId')
  async updateItemCart(
    @Param('cartId') id: string,
    @Body() data: CreateItemCartDto,
    @Req() req: RequestUser,
  ) {
    if (!req.user) {
      throw new UnauthorizedException('Bạn cần đăng nhập để cập nhập item');
    }
    const cart = await this.cartsService.update(id, data);
    return {
      message: 'Cập nhập item thành công',
      cart,
    };
  }

  @Get('/user/:userId')
  async getCartByUserId(
    @Param('userId') userId: string,
    @Req() req: RequestUser,
  ) {
    if (!req.user) {
      throw new UnauthorizedException(
        'Bạn cần đăng nhập để lấy danh sách item',
      );
    }
    if (userId !== req.user.sub.toString()) {
      throw new UnauthorizedException('Bạn không có quyền lấy danh sách item');
    }
    return await this.cartsService.findAllByUserId(userId);
  }

  @Delete('/items/:cartId/:itemId')
  async deleteItemCart(
    @Param('cartId') cartId: string,
    @Param('itemId') itemId: string,
    @Req() req: RequestUser,
  ) {
    if (!cartId || !itemId) {
      throw new BadRequestException('Cart ID and item ID are required');
    }
    if (!req.user) {
      throw new UnauthorizedException('Bạn cần đăng nhập để xóa item');
    }

    const cart = await this.cartsService.deleteItem(
      cartId,
      itemId,
      req.user.sub.toString(),
    );
    return {
      message: 'Delete item cart successfully',
      cart,
    };
  }
}
