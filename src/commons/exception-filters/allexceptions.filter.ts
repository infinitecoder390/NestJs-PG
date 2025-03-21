import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ErrorResponseDto } from '../dtos/error-response.dto';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost): void {
    let { message: errMsg, stack: errStack, name: errName } = exception;

    console.log('errMsg', errMsg);
    console.log('errStack', errStack);
    console.log('errName', errName);

    let ctx = host.switchToHttp();
    let req = ctx.getRequest();
    let res = ctx.getResponse();
    if (exception instanceof HttpException) {
      const errorRes = exception.getResponse();

      res.statusCode = exception.getStatus();

      const message =
        typeof errorRes === 'object' && typeof errorRes['message'] === 'object'
          ? errorRes['message'][0]
          : errorRes['message'];
      const errorResponseDto: ErrorResponseDto =
        ErrorResponseDto.getFilledResponseObjectAllArgs(
          null,
          message.split(':')[1],
          message.split(':')[0],
        );
      res.json(errorResponseDto);

      return;
    }

    res.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    const errorResponseDto: ErrorResponseDto =
      ErrorResponseDto.getFilledResponseObjectAllArgs(
        null,
        exception.stack,
        'E_1000',
      );
    res.json(errorResponseDto);

    return;

    res.json({ error: exception.name, message: exception.stack });
  }
}
