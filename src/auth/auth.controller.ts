import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/commons/decorators';
import { SuccessResponseDto } from 'src/commons/dtos/success-response.dto';
import { AuthService } from './auth.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginAuthDto, LoginAuthHeaderDto } from './dto/login-auth.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@ApiBearerAuth()
@ApiTags('Auth')
@Controller({
  version: '1',
  path: 'auth',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async create(
    @Headers() authHeader: LoginAuthHeaderDto,
    @Body() createAuthDto: LoginAuthDto,
  ) {
    const auth = await this.authService.create(
      authHeader.client_id,
      createAuthDto,
    );

    return SuccessResponseDto.getResponseObject(
      auth,
      'Success in auth login',
      null,
    );
  }

  @Public()
  @Post('/refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Headers('client_id') clientId: string,
    @Headers('refreshToken') refreshToken: string,
  ) {
    const result = await this.authService.getAccessTokenByRefreshToken(
      clientId,
      refreshToken,
    );

    return SuccessResponseDto.getResponseObject(
      result,
      'Access token generated successfully.',
      null,
    );
  }

  @Public()
  @Post('/log-out')
  @HttpCode(HttpStatus.OK)
  async logOut(
    @Headers('client_id') clientId: string,
    @Headers('Authorization') authAccessToken: string,
  ) {
    const result = await this.authService.logOut(clientId, authAccessToken);
    return SuccessResponseDto.getResponseObject(
      result,
      'Log out successfully.',
      null,
    );
  }

  // @Public()
  // @Post('forgot-password')
  // async forgotPassword(
  //   @Body() forgotPasswordDto: ForgotPasswordDto,
  // ): Promise<{ message: string }> {
  //   await this.authService.sendOtp(forgotPasswordDto.userName);
  //   return SuccessResponseDto.getResponseObject(
  //     {},
  //     'OTP sent to your email',
  //     null,
  //   );
  // }

  // @Public()
  // @Post('verify-otp')
  // async verifyOtp(
  //   @Body() verifyOtpDto: VerifyOtpDto,
  // ): Promise<{ message: string }> {
  //   await this.authService.verifyOtp(verifyOtpDto);
  //   return SuccessResponseDto.getResponseObject({}, 'OTP verified', null);
  // }

  // @Public()
  // @Post('reset-password')
  // async resetPassword(
  //   @Body() resetPasswordDto: ResetPasswordDto,
  // ): Promise<{ message: string }> {
  //   const user = await this.authService.resetPassword(resetPasswordDto);
  //   return SuccessResponseDto.getResponseObject(
  //     user,
  //     'Password reset successfully',
  //     null,
  //   );
  // }

  // @Get()
  // findAll() {
  //   return this.authService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.authService.findOne(+id);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.authService.remove(+id);
  // }
}
