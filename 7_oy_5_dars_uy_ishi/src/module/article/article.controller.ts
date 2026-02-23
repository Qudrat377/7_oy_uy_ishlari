import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, UseGuards, Req, Query } from '@nestjs/common';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiCreatedResponse, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import {diskStorage} from "multer"
import path from 'path';
import { CreateArticleSwaggerDto } from './dto/create-swagger-image.dto';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { Roles } from 'src/common/decorators/roles,decorator';
import { UserRole } from 'src/shared/constants/user.role';
import { QueryDto } from './dto/query.dto';

@ApiBearerAuth("JWT-auth")
@UseGuards(AuthGuard)
@ApiTags("Article")
@ApiInternalServerErrorResponse({description: "Internal server error"})
@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}
  
  @UseGuards(RolesGuard)
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({description: "Create article api (public)"})
  @ApiConsumes("multipart/form-data")
  @ApiBody({type: CreateArticleSwaggerDto})
  @ApiCreatedResponse({description: "Created"})
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: path.join(process.cwd(), "uploads"),
        filename: (req, file, cb) => {
          const uniqueName = `${file.fieldname}${Math.random() * 1e9}`
          const ext = path.extname(file.originalname)
          cb(null, `${uniqueName}${ext}`)
        }
      })
    })
  )
  @Post()
  create(
    @Body() createArticleDto: CreateArticleDto, 
    @UploadedFile() file: Express.Multer.File,
    @Req() req
  ) {    
    return this.articleService.create(createArticleDto, file, req.user.id);
  }

  @ApiOperation({description: "Get All articles api (public)"})
  @ApiOkResponse({description: "list of articles"})
  @Get()
  findAll(@Query() query: QueryDto) {
    return this.articleService.findAll(query);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({description: "Get All my articles api (owner)"})
  @ApiOkResponse({description: "list of articles"})
  @Get("my-articles")
  findAllMyArticles(@Req() req) {
    return this.articleService.findAllMyArticles(req.user.id);
  }

  @ApiOperation({description: "Get one article api (public)"})
  @ApiNotFoundResponse({description: "Article not found"})
  @ApiOkResponse({description: "GEt one article"})
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.articleService.findOne(+id);
  }

  // @UseGuards(RolesGuard)
  // @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  // @ApiOperation({description: "Update article api (owner)"})
  // @ApiBody({type: CreateArticleDto})
  // @ApiNotFoundResponse({description: "Article not found"})
  // @ApiOkResponse({description: "Updated article"})
  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateArticleDto: UpdateArticleDto) {
  //   return this.articleService.update(+id, updateArticleDto);
  // }

  @UseGuards(RolesGuard)
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({description: "Delete article api (owner)"})
  @ApiNotFoundResponse({description: "Article not found"})
  @ApiOkResponse({description: "Deleted article"})
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.articleService.remove(+id, req.user.id);
  }
}
