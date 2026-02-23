import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Tag } from './entities/tag.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TagsService {
  constructor(@InjectRepository(Tag) private tagsRepository: Repository<Tag>) {}

  async create(createTagDto: CreateTagDto, userId) {

    const foundedTags = await this.tagsRepository.findOne({where: {name: createTagDto.name}})    

    if(foundedTags) throw new BadRequestException("Tag name already exists")

    const tag = this.tagsRepository.create({
      ...createTagDto,
      createdBy: userId
    })

    return this.tagsRepository.save(tag)
  }

  async findAll() {
    return await this.tagsRepository.find()
  }

  findOne(id: number) {
    return `This action returns a #${id} tag`;
  }

  update(id: number, updateTagDto: UpdateTagDto) {
    return `This action updates a #${id} tag`;
  }

  remove(id: number) {
    return `This action removes a #${id} tag`;
  }
}
