//shu buyruq bilan ishlatiladi bu fayldagi test rejimi npx ts-node test-ai.ts

import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

async function runFinalTest() {
    const API_KEY = process.env.GEMINI_API_KEY;
    // Ro'yxatingizda aniq bor bo'lgan model nomi
    const model = "gemini-flash-latest"; 
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;

    console.log(`📡 [${model}] modeli bilan aloqa o'rnatilmoqda...`);

    const testPrompt = {
        contents: [{
            parts: [{
                text: "Matematikadan bitta test savoli tuz va JSON formatida qaytar: {'question': '...', 'options': ['...', '...'], 'correct_option_id': 0}. O'zbek tilida bo'lsin."
            }]
        }],
        generationConfig: {
            responseMimeType: "application/json"
        }
    };

    try {
        const startTime = Date.now();
        const response = await axios.post(url, testPrompt);
        const duration = Date.now() - startTime;

        if (response.data && response.data.candidates) {
            const rawText = response.data.candidates[0].content.parts[0].text;
            const parsedData = JSON.parse(rawText);

            console.log("\n✅ TEST MUVAFFAQIYATLI YAKUNLANDI!");
            console.log(`⏱ Javob vaqti: ${duration}ms`);
            console.log("🤖 AI tomonidan yaratilgan savol:");
            console.log("------------------------------------------");
            console.log(`Savol: ${parsedData.question}`);
            console.log(`Variantlar: ${parsedData.options.join(", ")}`);
            console.log(`To'g'ri javob ID: ${parsedData.correct_option_id}`);
            console.log("------------------------------------------");
        }
    } catch (error: any) {
        console.error("\n❌ TESTDA XATOLIK!");
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error("Xabar:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error("Xato xabari:", error.message);
        }
    }
}

runFinalTest();

// -------------------------------------------------ruxsat tekshirish 

//shu buyruq bilan ishlatiladi bu fayldagi test rejimi npx ts-node test-ai.ts

// import axios from 'axios';
// import * as dotenv from 'dotenv';

// dotenv.config();

// async function listMyModels() {
//     const API_KEY = process.env.GEMINI_API_KEY;
//     // Diqqat: Bu URL sizga ruxsat berilgan barcha modellarni qaytaradi
//     const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

//     try {
//         console.log("Sizga ruxsat berilgan modellar ro'yxati olinmoqda...");
//         const response = await axios.get(url);
        
//         console.log("✅ Topilgan modellar:");
//         response.data.models.forEach((m: any) => {
//             console.log(`- ${m.name} (Metodlar: ${m.supportedGenerationMethods})`);
//         });
//     } catch (error: any) {
//         console.error("❌ Xatolik:");
//         console.error(error.response?.data || error.message);
//     }
// }

// listMyModels();