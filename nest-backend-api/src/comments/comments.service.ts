import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment, CommentDocument } from './entities/comment.entity';
import { UsersService } from 'src/users/users.service';
import { ProductsService } from 'src/products/products.service';
import { ITypeAction } from 'src/types';
import { TypeAction } from 'src/enum';

const populate = ['user', 'product', 'likes'];
const populateReplyComment = [
  {
    path: 'user',
    model: 'User',
  },
  {
    path: 'likes',
    model: 'User',
  },
  {
    path: 'reply',
    populate: {
      path: 'user',
      model: 'User',
    },
  },
];

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
    private readonly userService: UsersService,
    private readonly productService: ProductsService,
  ) {}
  async create(createCommentDto: Partial<Comment>) {
    const comment = await this.commentModel.create(createCommentDto);
    return comment;
  }

  async findAll(productId: string) {
    const comments = await this.commentModel
      .find({ product: productId, commentRoot: null })
      .sort({
        createdAt: -1,
      })
      .populate(populateReplyComment);
    const total = await this.commentModel.countDocuments({
      product: productId,
    });

    return [comments, total];
  }

  async findOne(id: string) {
    const comment = await this.commentModel.findById(id).populate(populate);
    return comment;
  }

  async update(id: string, updateCommentDto: Partial<Comment>) {
    const comment = await this.commentModel.findByIdAndUpdate(
      id,
      updateCommentDto,
      { new: true },
    );
    return comment;
  }

  async remove(id: string) {
    const comment = await this.commentModel.findByIdAndDelete(id);
    return comment;
  }

  async like(id: string, userId: Types.ObjectId) {
    const existingComment = await this.commentModel.findById(id);
    if (!existingComment) {
      throw new NotFoundException('Bình luận không tồn tại');
    }

    if (existingComment.likes?.includes(userId)) {
      throw new BadRequestException('Bạn đã thích bình luận này rồi');
    }

    const updatedComment = await this.commentModel.findByIdAndUpdate(
      id,
      { $push: { likes: userId } },
      { new: true },
    );
    return updatedComment;
  }

  async unlike(id: string, userId: Types.ObjectId) {
    const comment = await this.commentModel.findByIdAndUpdate(
      id,
      { $pull: { likes: userId } },
      { new: true },
    );
    return comment;
  }

  async reply(id: string, data: Partial<Comment>) {
    // 1. Kiểm tra comment gốc
    const parentComment = await this.findOne(id);
    if (!parentComment) {
      throw new NotFoundException('Bình luận không tồn tại');
    }

    try {
      // 2. Tạo comment reply với commentRoot
      const commentReply = new this.commentModel({
        ...data,
        commentRoot: parentComment._id,
      });

      // 3. Lưu reply vào DB
      await commentReply.save();

      // 4. Cập nhật mảng reply của comment cha
      const updatedComment = await this.commentModel.findByIdAndUpdate(
        id,
        {
          $push: {
            reply: { $each: [commentReply._id], $position: 0 },
          },
        },
        {
          new: true,
          runValidators: true,
        },
      );

      // 5. Populate nếu cần
      return updatedComment?.populate(populateReplyComment);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async likeReply(commentRootId: string, id: string, userId: Types.ObjectId) {
    try {
      const comment = await this.commentModel.findByIdAndUpdate(
        id,
        { $push: { likes: userId } },
        { new: true },
      );

      if (comment) {
        const commentRoot = await this.findOne(commentRootId);
        if (commentRoot) {
          return commentRoot.populate(populateReplyComment);
        }
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async unlikeReply(commentRootId: string, id: string, userId: Types.ObjectId) {
    // get comment root
    try {
      const comment = await this.findOne(id);
      if (comment) {
        const likes = comment?.likes?.filter((x) => x !== userId);
        comment.likes = likes;
        await comment.save();
        const commentRoot = await this.findOne(commentRootId);
        if (commentRoot) {
          return commentRoot.populate(populateReplyComment);
        }
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async deleteReply(id: string, replyId: string) {
    const comment = await this.commentModel.findByIdAndUpdate(
      { _id: id, 'reply._id': replyId },
      { $pull: { reply: replyId } },
      { new: true },
    );
    return comment;
  }

  async updateReply(
    id: string,
    replyId: string,
    updateCommentDto: Partial<Comment>,
  ) {
    const comment = await this.commentModel.findByIdAndUpdate(
      { _id: id, 'reply._id': replyId },
      { $set: { 'reply.$.comment': updateCommentDto.comment } },
      { new: true },
    );
    return comment;
  }

  async updateComment(id: string, updateCommentDto: Partial<CommentDocument>) {
    const comment = await this.commentModel.findByIdAndUpdate(
      id,
      updateCommentDto,
      { new: true },
    );
    return comment;
  }

  async updateUserAndProductForComment(
    type: ITypeAction,
    userId: Types.ObjectId,
    productId: Types.ObjectId,
    id: string,
  ) {
    const updateUser =
      type === TypeAction.DELETE
        ? { $pull: { comments: id } }
        : { $push: { comments: { $each: [id], $position: 0 } } };

    const updateProduct =
      type === TypeAction.DELETE
        ? { $pull: { comments: id } }
        : { $push: { comments: { $each: [id], $position: 0 } } };

    await this.userService.updateAny(userId.toString(), updateUser);
    await this.productService.updateAny(productId.toString(), updateProduct);
  }

  async delete(id: string, userId: Types.ObjectId) {
    const comment = await this.commentModel.findOne({
      _id: id,
      user: userId,
    });
    if (!comment) {
      throw new NotFoundException('Bình luận không tồn tại');
    }

    if (comment.user.toString() !== userId.toString()) {
      throw new ForbiddenException('Bạn không có quyền xóa bình luận này');
    }
    return comment;
  }

  async updateReplyComment(
    commentRootId: string,
    id: string,
    data: Partial<Comment>,
  ) {
    try {
      // update reply comment
      const comment = await this.findOne(id);

      if (!comment) {
        throw new NotFoundException('Bình luận không tồn tại');
      }

      if (comment.commentRoot) {
        throw new BadRequestException('Bình luận không phải là phản hồi');
      }

      if (typeof data.comment !== 'string') {
        throw new BadRequestException('Nội dung bình luận không hợp lệ');
      }

      comment.comment = data.comment;
      await comment.save();

      // return comment root
      const commentRoot = await this.findOne(commentRootId);
      if (!commentRoot) {
        throw new NotFoundException('Bình luận gốc không tồn tại');
      }

      return commentRoot?.populate(populateReplyComment);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
