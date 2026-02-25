import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({timestamps: true, versionKey: false})
export class Item extends Document {
    @Prop()
    name: string;

    @Prop()
    price: number;
}

export const ItemSchema = SchemaFactory.createForClass(Item)