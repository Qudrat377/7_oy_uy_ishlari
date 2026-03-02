import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Bot, botSchema } from "src/schema/bot.schema";
import { BotService } from "./generetAI.questions.service";
import { Quiz, quizSchema } from "src/schema/quiz.schema";
import { OptionsQuiz, OptionsQuizSchema } from "src/schema/options.schema";
// import { BotService } from "./bot.service";

@Module({
    imports: [MongooseModule.forFeature([
        {name: Bot.name, schema: botSchema}, 
        {name: Quiz.name, schema: quizSchema}, 
        {name: OptionsQuiz.name, schema: OptionsQuizSchema}
    ])],
    providers: [BotService]
})

export class BotModule{}