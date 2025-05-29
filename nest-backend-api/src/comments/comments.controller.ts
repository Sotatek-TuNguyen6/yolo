import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UnauthorizedException,
  UseGuards,
  BadRequestException,
  Put,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { UpdateCommentDto } from './dto/update-comment.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RequestUser } from 'src/interface/common.interface';
import { Comment } from './entities/comment.entity';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/decorator/roles.guard';
import { TypeAction } from 'src/enum';
import { IReplyLikeParams } from 'src/interface/comment.interface';
import { CreateCommentDto } from './dto/create-comment.dto';

@ApiTags('Comments')
@Controller('comments')
@ApiBearerAuth('jwt')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @ApiOperation({ summary: 'Tạo bình luận' })
  @ApiBody({ type: CreateCommentDto })
  @ApiResponse({ status: 201, description: 'Bình luận đã được tạo thành công' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post()
  async create(
    @Body() createCommentDto: CreateCommentDto,
    @Req() req: RequestUser,
  ) {
    if (!req.user) {
      throw new UnauthorizedException('Bạn cần đăng nhập để tạo bình luận');
    }
    const comment = await this.commentsService.create({
      ...createCommentDto,
      user: req.user.sub,
    });

    await this.commentsService.updateUserAndProductForComment(
      TypeAction.CREATE,
      req.user.sub,
      createCommentDto.product,
      comment?._id.toString(),
    );
    return comment;
  }

  @Get('/:productId')
  async getAllCommentsByProductId(@Param('productId') id: string) {
    const [comments, total] = await this.commentsService.findAll(id);

    return {
      comments,
      total,
    };
  }

  @Post('/')
  @ApiOperation({ summary: 'Tạo bình luận' })
  @ApiBody({ type: Comment })
  @ApiResponse({ status: 201, description: 'Bình luận đã được tạo thành công' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async createComment(@Body() data: CreateCommentDto, @Req() req: RequestUser) {
    if (!req.user) {
      throw new UnauthorizedException('Bạn cần đăng nhập để tạo bình luận');
    }
    const comment = await this.commentsService.create({
      ...data,
      user: req.user.sub,
    });

    if (!comment) {
      throw new BadRequestException('Tạo bình luận thất bại');
    }

    await this.commentsService.updateUserAndProductForComment(
      TypeAction.CREATE,
      req.user.sub,
      data.product,
      comment?._id.toString(),
    );
    return comment;
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.commentsService.findOne(id);
  // }

  @ApiOperation({ summary: 'Cập nhật bình luận' })
  @ApiBody({ type: Comment })
  @ApiResponse({
    status: 200,
    description: 'Bình luận đã được cập nhật thành công',
  })
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto) {
    return this.commentsService.update(id, updateCommentDto);
  }

  @ApiOperation({ summary: 'Xóa bình luận' })
  @ApiBody({ type: Comment })
  @ApiResponse({ status: 200, description: 'Bình luận đã được xóa thành công' })
  @Delete('/:commentId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async deleteComment(@Param('commentId') id: string, @Req() req: RequestUser) {
    if (!req.user) {
      throw new UnauthorizedException('Bạn cần đăng nhập để xóa bình luận');
    }
    const comment = await this.commentsService.delete(id, req.user.sub);
    await this.commentsService.updateUserAndProductForComment(
      TypeAction.DELETE,
      req.user.sub,
      comment.product,
      id,
    );
    return comment;
  }

  @ApiOperation({ summary: 'Thích bình luận' })
  @ApiResponse({
    status: 200,
    description: 'Bình luận đã được thích thành công',
  })
  @Get('/like/:commentId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async likeComment(@Param('commentId') id: string, @Req() req: RequestUser) {
    if (!req.user) {
      throw new UnauthorizedException('Bạn cần đăng nhập để thích bình luận');
    }
    const comment = await this.commentsService.like(id, req.user.sub);
    return comment;
  }

  @ApiOperation({ summary: 'Bỏ thích bình luận' })
  @ApiResponse({
    status: 200,
    description: 'Bình luận đã được bỏ thích thành công',
  })
  @Get('/unlike/:commentId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async unlikeComment(@Param('commentId') id: string, @Req() req: RequestUser) {
    if (!req.user) {
      throw new UnauthorizedException(
        'Bạn cần đăng nhập để bỏ thích bình luận',
      );
    }
    const comment = await this.commentsService.unlike(id, req.user.sub);
    return comment;
  }

  @ApiOperation({ summary: 'Trả lời bình luận' })
  @ApiBody({ type: Comment })
  @ApiResponse({
    status: 200,
    description: 'Bình luận đã được trả lời thành công',
  })
  @Post('/reply/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async replyComment(
    @Param('id') id: string,
    @Body() data: Partial<Comment>,
    @Req() req: RequestUser,
  ) {
    if (!req.user) {
      throw new UnauthorizedException('Bạn cần đăng nhập để trả lời bình luận');
    }
    const dataReply = {
      ...data,
      user: req.user.sub,
    };
    const comment = await this.commentsService.reply(id, dataReply);
    return { comment };
  }

  @ApiOperation({ summary: 'Thích phản hồi bình luận' })
  @ApiBody({ type: Comment })
  @ApiResponse({
    status: 200,
    description: 'Phản hồi bình luận đã được thích thành công',
  })
  @Get('/reply/like/:commentRootId/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async likeReplyComment(
    @Param() params: IReplyLikeParams,
    @Req() req: RequestUser,
  ) {
    if (!req.user) {
      throw new UnauthorizedException('Bạn cần đăng nhập để thích bình luận');
    }

    const comment = await this.commentsService.likeReply(
      params.commentRootId,
      params.id,
      req.user.sub,
    );
    return comment;
  }

  @ApiOperation({ summary: 'Bỏ thích phản hồi bình luận' })
  @ApiBody({ type: Comment })
  @ApiResponse({
    status: 200,
    description: 'Phản hồi bình luận đã được bỏ thích thành công',
  })
  @Get('/reply/unlike/:commentRootId/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async unlikeReplyComment(
    @Param() params: IReplyLikeParams,
    @Req() req: RequestUser,
  ) {
    if (!req.user) {
      throw new UnauthorizedException(
        'Bạn cần đăng nhập để bỏ thích bình luận',
      );
    }

    const comment = await this.commentsService.unlikeReply(
      params.commentRootId,
      params.id,
      req.user.sub,
    );
    return {
      message: 'Bỏ thích bình luận thành công',
      comment,
    };
  }

  @ApiOperation({ summary: 'Cập nhập phản hồi bình luận' })
  @ApiBody({ type: Comment })
  @ApiResponse({
    status: 200,
    description: 'Phản hồi bình luận đã được cập nhật thành công',
  })
  @Put('/reply/:commentRootId/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async updateReplyComment(
    @Param() params: IReplyLikeParams,
    @Body() data: Partial<Comment>,
  ) {
    const comment = await this.commentsService.updateReplyComment(
      params.commentRootId,
      params.id,
      data,
    );
    return {
      message: 'Cập nhập phản hồi bình luận thành công',
      comment,
    };
  }

  @ApiOperation({ summary: 'Xóa phản hồi bình luận' })
  @ApiBody({ type: Comment })
  @ApiResponse({
    status: 200,
    description: 'Phản hồi bình luận đã được xóa thành công',
  })
  @Delete('/reply/:commentRootId/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async deleteReplyComment(@Param() params: IReplyLikeParams) {
    const comment = await this.commentsService.deleteReply(
      params.commentRootId,
      params.id,
    );
    return {
      message: 'Xóa bình luận phản hồi thành công',
      comment,
    };
  }
  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.commentsService.remove(id);
  // }
}
