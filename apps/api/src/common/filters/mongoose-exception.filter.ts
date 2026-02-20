import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import mongoose from 'mongoose';

@Catch(mongoose.Error.ValidationError, mongoose.Error.CastError)
export class MongooseExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof mongoose.Error.ValidationError) {
      const details = Object.values(exception.errors)
        .map((error) => error.message)
        .filter(Boolean);
      const message = details.length > 0 ? details : 'Validation failed';

      response.status(400).json({
        statusCode: 400,
        message,
        error: 'Bad Request',
      });
      return;
    }

    if (exception instanceof mongoose.Error.CastError) {
      const badRequest = new BadRequestException(`Invalid value for ${exception.path}`);
      const payload = badRequest.getResponse();
      response.status(400).json(payload);
      return;
    }

    response.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
      error: 'Internal Server Error',
    });
  }
}
