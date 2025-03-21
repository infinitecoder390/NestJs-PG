import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';
import { VerifyOtpDto } from './verify-otp.dto';
import { CommonMethods } from 'src/commons/utils/common-methods';

export class ResetPasswordDto extends VerifyOtpDto {
  @ApiProperty({
    description: 'New password',
    minLength: 8,
    // pattern: '^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
  })
  @IsString()
  @MinLength(8, {
    message: CommonMethods.getErrorMsgCombinedString('usr_1005'),
  })
  @Matches(
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    { message: CommonMethods.getErrorMsgCombinedString('usr_1044') },
  )
  @IsNotEmpty({ message: CommonMethods.getErrorMsgCombinedString('usr_1006') })
  newPassword: string;
}
