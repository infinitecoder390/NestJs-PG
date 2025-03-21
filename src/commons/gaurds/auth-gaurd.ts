import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { AuthService } from 'src/auth/auth.service';
import { CheckAuthDto } from 'src/auth/dto/check-auth.dto';
import { IS_PUBLIC_KEY } from '../decorators';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private reflector: Reflector,
    private readonly authorizationService: AuthService,
  ) {}

  logger: LoggerService = new LoggerService();
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    let isValid = false;
    const req = context.switchToHttp().getRequest();
    const dto = new CheckAuthDto();
    dto.jwt = req.headers['authorization']?.split(' ')[1];
    dto.apiEndPoint = req.originalUrl;
    dto.host = req.get('host');
    dto.protocol = req.protocol;
    dto.httpMethod = req.method;

    try {
      const response = await this.authorizationService.checkAuthorization(dto);

      isValid = response['sub'] ? true : false;
      req.userId = response['sub'];
      req.JWT = response;
    } catch (error) {
      if (error?.response) {
        throw new UnauthorizedException(
          error?.response?.message,
          error?.response?.statusCode,
        );
      } else {
        throw new BadRequestException(error?.message);
      }
    }
    return isValid;
  }
}
