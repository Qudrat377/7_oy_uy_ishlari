import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import TelegramBot from "node-telegram-bot-api";

// Schemalarni import qilish
import { Bot, BotDocument } from "src/schema/bot.schema";
import { OptionsQuiz, OptionsQuizDocument } from "src/schema/options.schema";
import { Quiz, QuizDocument } from "src/schema/quiz.schema";

@Injectable()
export class BotService implements OnModuleInit {
  private bot: TelegramBot;
  
  // 🛠 TEST REJIMINI BOSHQARISH
  // true - AI ishlatmaydi (soxta savollar)
  // false - Gemini AI orqali ishlaydi
  private isTestMode = true;

  constructor(
    @InjectModel(Bot.name) private botModel: Model<BotDocument>,
    @InjectModel(OptionsQuiz.name) private optionsQuizModel: Model<OptionsQuizDocument>,
    @InjectModel(Quiz.name) private quizModel: Model<QuizDocument>,
  ) {
    this.bot = new TelegramBot(process.env.BOT_TOKEN as string, { polling: true });
    this.bot.setMyCommands([
            {
                command: "/start", description: "botdan ro'yxatdan o'tish"
            },
            {
                command: "/commands", description: "Amalar"
            }
        ])
  }

  onModuleInit() {
    this.setupHandlers();
  }

  /**
   * Gemini AI orqali yoki Mock (soxta) savol olish
   */
  async getAIQuestion(level: number) {
        let rendom = Math.floor(Math.random() * 2)
        let bulin = [false, true]
    // Agar test rejimi yoqilgan bo'lsa
    if (bulin[rendom]) {
        let ong = Math.floor(Math.random() * 100)
        let chap = Math.floor(Math.random() * 100)
        let optsion = Math.floor(Math.random() * 2)
        let osion = ["-", "+"]

        if (ong + chap > 100 || ong - chap < 0) {
            console.log(ong, chap);
            
            while (ong + chap > 100 || ong - chap < 0) {
             ong = Math.floor(Math.random() * 100)
             chap = Math.floor(Math.random() * 100)
            }
        }
        const expression = `${ong} ${osion[optsion]} ${chap}`;
        // eval() orqali stringni matematik hisoblash
        const result = eval(expression);
        
      return {
        question: `(Test) ${level}-darajali savol: ${ong} ${osion[optsion]} ${chap} nechaga teng?`,
        answer: (result).toString()
        
      };
    }

    // Haqiqiy AI rejimi
    const apiKey = process.env.GEMINI_API_KEY;
    // const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

    const prompt = `Matematikadan ${1}-darajali qisqa masala ber. 
    Javobni FAQAT mana bu JSON formatida qaytar: 
    {"question": "2+2", "answer": "4"}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    const data: any = await response.json();
    const rawText = data.candidates[0].content.parts[0].text;
    return JSON.parse(rawText);
  }

  private setupHandlers() {
    this.bot.on("message", async (msg) => {
      const chatId = msg.from?.id as number;
      const text = msg.text;
      if (!chatId || !text) return;

      let user = await this.botModel.findOne({ chatId });

      // 1. START - Ro'yxatdan o'tish
      if (text === "/start") {
        if (!user) {
          user = await this.botModel.create({ name: msg.from?.first_name, chatId, xp: 0 });
        }
        return this.bot.sendMessage(chatId, `Xush kelibsiz ${msg.from?.first_name}! Masalalarni boshlash uchun 'GO' tugmasini bosing.`, {
          reply_markup: { keyboard: [[{ text: "GO" }]], resize_keyboard: true, one_time_keyboard: true }
        });
      }

      if (!user) return this.bot.sendMessage(chatId, "Iltimos avval /start ni bosing.");

      // 2. TESTNI BOSHLASH
      if (text === "GO") {
        const newSession = await this.optionsQuizModel.create({
          ownerId: user._id as any,
          currentStep: 1,
          isFinished: false
        });

        await this.bot.sendMessage(chatId, "🚀 10 talik test boshlandi!");
        return this.sendNextQuestion(chatId, 1, newSession._id as any);
      }

    // COMMONDS 
    if (text === "/commands") {
                this.bot.sendMessage(chatId, "Amallar", {
                    reply_markup: {
                        keyboard: [
                            
                            [
                                {
                                    text: "Photo"
                                },
                                {
                                    text: "Video"
                                },
                                {
                                    text: "Poll",
                                    request_poll: {
                                        type: "quiz"
                                    }
                                }
                            ],
                            [
                                {
                                    text: "Contact",
                                    request_contact: true
                                },
                                {
                                    text: "Location",
                                    request_location: true
                                }
                            ]
                        ],
                        resize_keyboard: true,
                        one_time_keyboard: true
                    }
                })
            }


      // 3. JAVOBNI TEKSHIRISH
      const activeSession = await this.optionsQuizModel.findOne({
        ownerId: user._id,
        isFinished: false
      }).sort({ createdAt: -1 });

      if (activeSession) {
        const lastQuiz = await this.quizModel.findOne({
          optionsId: activeSession._id
        }).sort({ createdAt: -1 });

        // Agar oxirgi savolga hali javob berilmagan bo'lsa
        if (lastQuiz && !lastQuiz.userAnswer) {
          const isTrue = text.trim() === lastQuiz.correctAnswer;

          lastQuiz.userAnswer = text;
          lastQuiz.isTrue = isTrue;
          await lastQuiz.save();

          if (isTrue) {
            await this.bot.sendMessage(chatId, "✅ To'g'ri!");
          } else {
            await this.bot.sendMessage(chatId, `❌ Xato. To'g'ri javob: ${lastQuiz.correctAnswer}`);
          }

          // Keyingi qadam yoki yakunlash
          if (activeSession.currentStep < 10) {
            activeSession.currentStep += 1;
            await activeSession.save();
            return this.sendNextQuestion(chatId, activeSession.currentStep, activeSession._id as any);
          } else {
            activeSession.isFinished = true;
            await activeSession.save();

            const correctCount = await this.quizModel.countDocuments({
              optionsId: activeSession._id,
              isTrue: true
            });

            const earnedXp = correctCount * 10;
            user.xp += earnedXp;
            await user.save();

            return this.bot.sendMessage(chatId, `🏁 Test tugadi!\n✅ To'g'ri: ${correctCount}/10\n✨ XP: +${earnedXp}`);
          }
        }
      }
    });
  }

  async sendNextQuestion(chatId: number, step: number, optionsId: Types.ObjectId) {
    try {
      await this.bot.sendChatAction(chatId, 'typing');
      const aiData = await this.getAIQuestion(step);

      await this.quizModel.create({
        optionsId: optionsId,
        question: aiData.question,
        correctAnswer: aiData.answer,
        userAnswer: "",
        isTrue: false
      });

      await this.bot.sendMessage(chatId, `❓ ${step}-savol dan:\n\n${aiData.question}`);

    } catch (e) {
      console.error("Xatolik:", e);
      this.bot.sendMessage(chatId, "Savol yuklashda xatolik yuz berdi.");
    }
  }
}







// import { Injectable, OnModuleInit, NotFoundException } from "@nestjs/common";
// import { InjectModel } from "@nestjs/mongoose";
// import { Model, Types } from "mongoose";
// import TelegramBot from "node-telegram-bot-api";

// // Schemalarni import qilish
// import { Bot, BotDocument } from "src/schema/bot.schema";
// import { OptionsQuiz, OptionsQuizDocument } from "src/schema/options.schema";
// import { Quiz, QuizDocument } from "src/schema/quiz.schema";

// @Injectable()
// export class BotService implements OnModuleInit {
//     private bot: TelegramBot;

//     constructor(
//         @InjectModel(Bot.name) private botModel: Model<BotDocument>,
//         @InjectModel(OptionsQuiz.name) private optionsQuizModel: Model<OptionsQuizDocument>,
//         @InjectModel(Quiz.name) private quizModel: Model<QuizDocument>,
//     ) {
//         this.bot = new TelegramBot(process.env.BOT_TOKEN as string, { polling: true });
//     }

//     onModuleInit() {
//         this.setupHandlers();
//     }

//     // Gemini AI orqali savol olish
//     async getAIQuestion(level: number) {
//         const apiKey = process.env.GEMINI_API_KEY;
//         const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

//         const prompt = `Matematikadan ${level}-darajali qisqa masala ber. 
//         Javobni FAQAT mana bu JSON formatida qaytar: 
//         {"question": "2+2", "answer": "4"}`;

//         const response = await fetch(url, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//                 contents: [{ parts: [{ text: prompt }] }],
//                 generationConfig: { responseMimeType: "application/json" }
//             })
//         });

//         const data: any = await response.json();
//         const rawText = data.candidates[0].content.parts[0].text;
//         return JSON.parse(rawText);
//     }

//     private setupHandlers() {
//         this.bot.on("message", async (msg) => {
//             const chatId = msg.from?.id as number;
//             const text = msg.text;
//             if (!chatId || !text) return;

//             let user = await this.botModel.findOne({ chatId });

//             // 1. START - Ro'yxatdan o'tish
//             if (text === "/start") {
//                 if (!user) {
//                     user = await this.botModel.create({ name: msg.from?.first_name, chatId, xp: 0 });
//                 }
//                 return this.bot.sendMessage(chatId, "Xush kelibsiz! Testni boshlash uchun 'Test' deb yozing.", {
//                     reply_markup: { keyboard: [[{ text: "Test" }]], resize_keyboard: true }
//                 });
//             }

//             if (!user) return this.bot.sendMessage(chatId, "Iltimos avval /start ni bosing.");

//             // 2. TESTNI BOSHLASH - Yangi OptionsQuiz (Seans) yaratish
//             if (text === "Test") {
//                 const newSession = await this.optionsQuizModel.create({
//                     ownerId: user._id as any,
//                     currentStep: 1,
//                     isFinished: false
//                 });

//                 await this.bot.sendMessage(chatId, "🚀 10 talik test boshlandi!");
//                 return this.sendNextQuestion(chatId, 1, newSession._id as any);
//             }

//             // 3. JAVOBNI TEKSHIRISH
//             // Hali tugallanmagan oxirgi test seansini topamiz
//             const activeSession = await this.optionsQuizModel.findOne({ 
//                 ownerId: user._id, 
//                 isFinished: false 
//             }).sort({ createdAt: -1 });

//             if (activeSession) {
//                 // Bizga hozirgina AI bergan savol kerak (oxirgi saqlangan savol)
//                 const lastQuiz = await this.quizModel.findOne({ 
//                     optionsId: activeSession._id
//                 }).sort({ createdAt: -1 });

//                 if (lastQuiz && !lastQuiz.userAnswer) {
//                     const isTrue = text.trim() === lastQuiz.correctAnswer;

//                     // Quiz hujjatini foydalanuvchi javobi bilan yangilaymiz
//                     lastQuiz.userAnswer = text;
//                     lastQuiz.isTrue = isTrue;
//                     await lastQuiz.save();

//                     if (isTrue) {
//                         await this.bot.sendMessage(chatId, "✅ To'g'ri!");
//                     } else {
//                         await this.bot.sendMessage(chatId, `❌ Xato. To'g'ri javob: ${lastQuiz.correctAnswer}`);
//                     }

//                     // Keyingi qadamga o'tamiz
//                     if (activeSession.currentStep < 10) {
//                         activeSession.currentStep += 1;
//                         await activeSession.save();
//                         return this.sendNextQuestion(chatId, activeSession.currentStep, activeSession._id as any);
//                     } else {
//                         // Test tugadi
//                         activeSession.isFinished = true;
//                         await activeSession.save();

//                         // Natijani hisoblash
//                         const correctCount = await this.quizModel.countDocuments({ 
//                             optionsId: activeSession._id, 
//                             isTrue: true 
//                         });

//                         // XP berish
//                         user.xp += (correctCount * 10);
//                         await user.save();

//                         return this.bot.sendMessage(chatId, `🏁 Test tugadi!\nTo'g'ri javoblar: ${correctCount}/10\nSizga ${correctCount * 10} XP qo'shildi! ✨`);
//                     }
//                 }
//             }
//         });
//     }

//     async sendNextQuestion(chatId: number, step: number, optionsId: Types.ObjectId) {
//         try {
//             await this.bot.sendChatAction(chatId, 'typing');
//             const aiData = await this.getAIQuestion(step);
            
//             // AI bergan savolni Quiz schemasiga yangi qator qilib qo'shamiz
//             // userAnswer va isTrue keyinroq (foydalanuvchi javob berganda) to'ldiriladi
//             await this.quizModel.create({
//                 optionsId: optionsId,
//                 question: aiData.question,
//                 correctAnswer: aiData.answer,
//                 userAnswer: "", // Hali javob berilmadi
//                 isTrue: false
//             });

//             await this.bot.sendMessage(chatId, `❓ ${step}-savol:\n\n${aiData.question}`);

//         } catch (e) {
//             console.error("AI Error:", e);
//             this.bot.sendMessage(chatId, "Savol yuklashda xatolik yuz berdi. Qayta urinib ko'ring.");
//         }
//     }
// }














// ------------------------------------------------------------------------------------eskisi 

// import { Injectable, NotFoundException, OnModuleInit } from "@nestjs/common";
// import { InjectModel } from "@nestjs/mongoose";
// import { Model } from "mongoose";
// import { Bot, BotDocument } from "src/schema/bot.schema";
// import TelegramBot from "node-telegram-bot-api";
// import { Quiz, QuizDocument } from "src/schema/quiz.schema";
// import { OptionsQuiz, OptionsQuizDocument } from "src/schema/options.schema";

// @Injectable()
// export class BotService implements OnModuleInit {
//     private bot: TelegramBot;

//     constructor(
//         @InjectModel(Bot.name) private botModel: Model<BotDocument>,
//         @InjectModel(Quiz.name) private quizModel: Model<QuizDocument>,
//         @InjectModel(OptionsQuiz.name) private OptionsQuizModel: Model<OptionsQuizDocument>,
//     ) {
//         this.bot = new TelegramBot(process.env.BOT_TOKEN as string, { polling: true });
//     }

//     onModuleInit() {
//         this.setupHandlers();
//     }

//     // Gemini AI orqali savol va javobni olish
//     async getAIQuestion(level: number) {
//         const apiKey = process.env.GEMINI_API_KEY;
//         const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

//         const prompt = `Matematikadan misoldagidek farmatda ${level}-darajali masala ber. Misol 2 + 1 
//         Javobni FAQAT mana bu JSON formatida qaytar: 
//         {"question": "savol matni", "answer": "faqat javob soni"}.`;

//         const response = await fetch(url, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//                 contents: [{ parts: [{ text: prompt }] }],
//                 generationConfig: { responseMimeType: "application/json" }
//             })
//         });

//         const data: any = await response.json();
//         const rawText = data.candidates[0].content.parts[0].text;
//         return JSON.parse(rawText);
//     }

//     private setupHandlers() {
//         this.bot.on("message", async (msg) => {
//             const chatId = msg.from?.id as number;
//             const text = msg.text;
//             if (!chatId || !text) return;

//             let user = await this.botModel.findOne({ chatId });

//             if(!user) throw new NotFoundException("User not found")

//             let optionsQuiz = await this.OptionsQuizModel.findOne({ownerId: user?._id as any});

//             if (!optionsQuiz) {
//                 await this.OptionsQuizModel.create({ownerId: user?._id as any});
//                 console.log("created options");
//             }

//             // -------------------------------bu kerakmas qator 3 tasi 
//             // <<< 
//             // if (optionsQuiz) {
//             //     await this.OptionsQuizModel.findByIdAndDelete({_id: optionsQuiz?._id})
//             //     console.log("deleted options");
//             // }
//             //  >>>

//             // user._id ni as any deb ko'rsatish orqali TypeScript qat'iyligini yumshatamiz
//             // let optionsQuiz = await this.OptionsQuizModel.findOne({ ownerId: user?._id as any });
//             // if(!optionsQuiz) throw new NotFoundException("OptionsQuiz not found")

//             // let quiz = await this.quizModel.findOne({optionsId: optionsQuiz?._id as any})     
//             // if(!quiz) throw new NotFoundException("Quiz not found")         

//             // 1. START
//             if (text === "/start") {
//                 if (!user) {
//                     user = await this.botModel.create({ name: msg.from?.first_name, chatId, xp: 0 });
//                 }
//                 await this.botModel.updateOne({ chatId }, { currentStep: 0, correctAnswers: 0 });
//                 await this.bot.sendMessage(chatId, `Xush kelibsiz ${msg.from?.first_name}! Testni boshlash uchun "Test" tugmasini bosing.`, {
//                     reply_markup: { keyboard: [[{ text: "Test" }]], resize_keyboard: true, one_time_keyboard: true }
//                 });
//                 return;
//             }

//             // 2. TESTNI BOSHLASH
//             if (text === "Test") {
//                 await this.bot.sendMessage(chatId, "10 talik test boshlandi! 1-savol:");
//                 await this.sendNextQuestion(chatId, 1);
//                 return;
//             }

//             // 3. JAVOBLARNI TEKSHIRISH (Agar foydalanuvchi test jarayonida bo'lsa)
//             // if (user && user.currentStep > 0 && user.currentStep <= 10) {
//             //     const isCorrect = text.toLowerCase().trim() === user.lastAnswer.toLowerCase().trim();
//             //     let correctCount = user.correctAnswers + (isCorrect ? 1 : 0);

//             //     if (isCorrect) {
//             //         await this.bot.sendMessage(chatId, "✅ To'g'ri!");
//             //     } else {
//             //         await this.bot.sendMessage(chatId, `❌ Noto'g'ri. To'g'ri javob: ${user.lastAnswer}`);
//             //     }

//             //     if (user.currentStep < 10) {
//             //         // Keyingi savolga o'tish
//             //         await this.botModel.updateOne({ chatId }, { 
//             //             currentStep: user.currentStep + 1, 
//             //             correctAnswers: correctCount 
//             //         });
//             //         await this.sendNextQuestion(chatId, user.currentStep + 1);
//             //     } else {
//             //         // Test tugadi
//             //         const earnedXp = correctCount * 10;
//             //         await this.botModel.updateOne({ chatId }, { 
//             //             $inc: { xp: earnedXp },
//             //             currentStep: 0 
//             //         });
//             //         await this.bot.sendMessage(chatId, `🏁 Test tugadi!\nNatija: 10 tadan ${correctCount} ta to'g'ri.\nSizga ${earnedXp} XP qo'shildi! ✨`);
//             //     }
//             // }
//         });
//     }

//     async sendNextQuestion(chatId: number, step: number) {
//         try {
//             await this.bot.sendChatAction(chatId, 'typing');
//             const aiData = await this.getAIQuestion(step);
            
//             await this.botModel.updateOne({ chatId }, { 
//                 currentStep: step, 
//                 lastAnswer: aiData.answer 
//             });

//             let user = await this.botModel.findOne({ chatId });
//             console.log(user);
//             if(!user) throw new NotFoundException("User not founded.")
                

//             // await this.OptionsQuizModel.findByIdAndUpdate({_id: user?._id}, { currentStep: step, ownerId: user?._id as any});
            
//             // let optionsQuiz = await this.OptionsQuizModel.findOne({ ownerId: {_id: user?._id} });

//             // if(!optionsQuiz) {
//             //     console.log("Topilmadi");
//             //     throw new NotFoundException("OptonsQuiz not founded.")
//             // }
            
//             //     console.log(optionsQuiz);

//             // await this.quizModel.create(optionsId: {optionsQuiz._id})

//             await this.bot.sendMessage(chatId, `${step}-savol: ${aiData.question}`);

//         } catch (e) {
//             this.bot.sendMessage(chatId, `Savol yuklashda xato bo'ldi, qaytadan urinib ko'ring. ${e.message}`);
//         }
//     }
// }