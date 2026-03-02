import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types, Schema as MongooseSchema } from "mongoose";

export type OptionsQuizDocument = OptionsQuiz & Document

@Schema({ timestamps: true, versionKey: false })
export class OptionsQuiz {
    // Bu yerda tipni Types.ObjectId deb yozing
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Bot", required: true })
    ownerId: Types.ObjectId; 

    @Prop({ default: false })
    isFinished: boolean;

    @Prop({ default: 1 })
    currentStep: number;
}

export const OptionsQuizSchema = SchemaFactory.createForClass(OptionsQuiz);

// import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
// import { Document, Schema as MongooseSchema } from "mongoose";

// export type OptionsQuizDocument = OptionsQuiz & Document

// @Schema({timestamps: true, versionKey: false})
// export class OptionsQuiz {
//     @Prop({type: MongooseSchema.Types.ObjectId, ref: "Bot", required: true})
//     ownerId: MongooseSchema.Types.ObjectId;

//     @Prop({default: false})
//     isFinished: boolean;

//     @Prop({ default: 1 })
//     currentStep: number; // 1 dan 10 gacha savollar uchun
// }

// export const OptionsQuizSchema = SchemaFactory.createForClass(OptionsQuiz)