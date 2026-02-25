import { Catch, ArgumentsHost, HttpException, ExceptionFilter} from "@nestjs/common"
import {Response} from "express"

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {

    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const status = exception instanceof HttpException ? exception.getStatus() : 500;
        const message = exception.message || "Internal server error";

        response.status(status).json({
            statusCode: status,
            message: message || "Internal server error",
            error: exception.name || "UnknownError",
            stack: exception.stack || "UnknowError",
            timeStamp: new Date().toISOString(),
        });
    }
}