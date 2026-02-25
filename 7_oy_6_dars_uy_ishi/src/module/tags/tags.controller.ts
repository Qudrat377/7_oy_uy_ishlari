import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, Req, UseGuards } from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { ApiBearerAuth, ApiInternalServerErrorResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guard/auth.guard';

@ApiBearerAuth("JWT-auth")
@UseGuards(AuthGuard)
@ApiTags("Tags")
@ApiInternalServerErrorResponse({description: "Internal server error"})
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @HttpCode(201)
  @Post("create")
  create(@Body() createTagDto: CreateTagDto, @Req() req) {
    
    return this.tagsService.create(createTagDto, req.user.id);
  }

  @Get()
  findAll() {
    return this.tagsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tagsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTagDto: UpdateTagDto) {
    return this.tagsService.update(+id, updateTagDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tagsService.remove(+id);
  }
}
