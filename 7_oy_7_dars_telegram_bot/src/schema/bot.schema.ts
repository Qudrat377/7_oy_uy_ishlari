import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type BotDocument = Bot & Document;

@Schema({ timestamps: true, versionKey: false })
export class Bot {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true})
  chatId: number;

  @Prop({ default: 0 })
  xp: number;
}

export const botSchema = SchemaFactory.createForClass(Bot);
