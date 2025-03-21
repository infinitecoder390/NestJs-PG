import { BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { ErrorResponseDto } from '../dtos/error-response.dto';
import { LoggerService } from '../logger/logger.service';
import { ApplicationConstants } from '../constants/application.constant';

export async function validateAndTransformDto<T extends Record<string, any>>(
  dtoClass: new () => T,
  inputDto: T,
): Promise<T> {
  const logger: LoggerService = new LoggerService();
  for (const key in inputDto) {
    if (typeof inputDto[key] === ApplicationConstants.STRING) {
      inputDto[key] = inputDto[key].trim();
    }
  }
  const validatedDto = plainToClass(dtoClass, inputDto);
  const errors = await validate(validatedDto);

  function getErrorObjectFromValidationErrorMessage(
    messagesWithCode: string[],
  ) {
    const messageWithCode: string = messagesWithCode[0];
    const code = messageWithCode
      .split(ApplicationConstants.SEPARATOR_SYMBOL)[0]
      .trim();
    const message = messageWithCode
      .split(ApplicationConstants.SEPARATOR_SYMBOL)[1]
      .trim();
    const debugData: string[] =
      process.env.NODE_ENV != ApplicationConstants.PROD_ENVIRONMENT_KEY
        ? messagesWithCode
        : null;
    return ErrorResponseDto.getFilledResponseObjectAllArgs(
      debugData,
      message,
      code,
    );
  }

  if (errors.length > 0) {
    const errorMessages = errors.map(
      (error) => error.constraints[Object.keys(error.constraints)[0]],
    );
    logger.error('All validation errors --> ' + errorMessages);
    const errorObject = getErrorObjectFromValidationErrorMessage(errorMessages);
    throw new BadRequestException(errorObject);
  }

  return validatedDto;
}
