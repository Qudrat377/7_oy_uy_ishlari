import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module";

async function bootstrap() {
    try{
        const app = await NestFactory.create(AppModule)

        app.setGlobalPrefix("api")
        app.enableCors()

        const PORT = process.env.PORT || 3000

        app.listen(PORT, () => {
            console.log("Server is running at: ", PORT);
            
        })
    }catch(error) {
        return error.message
    }
}

bootstrap()