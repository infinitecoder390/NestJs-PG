import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { CommonMethods } from 'src/commons/utils/common-methods';

export class LoginAuthDto {
  @ApiProperty()
  @IsNotEmpty({ message: CommonMethods.getErrorMsgCombinedString('AUTH_1001') })
  @IsString()
  phone: string;

  @ApiProperty({
    description: 'Password of the user',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty({ message: CommonMethods.getErrorMsgCombinedString('AUTH_1002') })
  password: string;
}

export class LoginAuthHeaderDto {
  @ApiProperty()
  @IsNotEmpty({ message: CommonMethods.getErrorMsgCombinedString('E_1012') })
  @IsString()
  client_id: string;
}
