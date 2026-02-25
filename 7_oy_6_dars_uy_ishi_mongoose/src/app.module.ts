import { Module } from '@nestjs/common';
import { ItemModule } from './item/item.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [
    ConfigModule.forRoot({envFilePath: ".env", isGlobal: true}),
    MongooseModule.forRoot(process.env.MONGO_URL as string),
    ItemModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
