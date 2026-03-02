import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema, Types } from "mongoose";
import { OptionsQuiz } from "./options.schema";

export type QuizDocument = Quiz & Document

@Schema({timestamps: true, versionKey: false})
export class Quiz {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: "OptionsQuiz", required: true })
    optionsId: Types.ObjectId; 
    
    @Prop({required: true})
    question: string

    @Prop({required: true})
    correctAnswer: string;

    @Prop()
    userAnswer: string;

    @Prop({ required: true })
    isTrue: boolean; // To'g'ri topdimi?
}

export const quizSchema = SchemaFactory.createForClass(Quiz)