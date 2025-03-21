import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';
import { CommonMethods } from 'src/commons/utils/common-methods';

export class UpdatePasswordDto {
  @ApiProperty({
    description: 'The current password of the user',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty({ message: CommonMethods.getErrorMsgCombinedString('USR_1009') })
  currentPassword: string;

  @ApiProperty({
    description: 'The new password of the user',
    minLength: 8,
    pattern:
      '^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
  })
  @IsString()
  @MinLength(8, {
    message: CommonMethods.getErrorMsgCombinedString('USR_1008'),
  })
  @Matches(
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    { message: CommonMethods.getErrorMsgCombinedString('USR_1010') },
  )
  @IsNotEmpty({ message: CommonMethods.getErrorMsgCombinedString('USR_1009') })
  newPassword: string;
}
