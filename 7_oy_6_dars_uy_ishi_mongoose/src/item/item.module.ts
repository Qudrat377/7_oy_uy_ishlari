import { Module } from '@nestjs/common';
import { ItemService } from './item.service';
import { ItemController } from './item.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Item, ItemSchema } from './entities/item.entity';

@Module({
  imports: [MongooseModule.forFeature([{name: Item.name, schema: ItemSchema}])],
  controllers: [ItemController],
  providers: [ItemService],
})
export class ItemModule {}
