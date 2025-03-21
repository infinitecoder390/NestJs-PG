import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { CommonMethods } from 'src/commons/utils/common-methods';

export class CreateUserDto {
  @ApiProperty({
    example: '1001',
    description: 'Unique identifier for the entity associated with the user',
  })
  @IsString({ message: CommonMethods.getErrorMsgCombinedString('USR_1001') })
  @IsNotEmpty({ message: CommonMethods.getErrorMsgCombinedString('USR_1002') })
  entity_id: string;

  @ApiProperty({
    example: 'Sunil',
    description: 'Full name of the user',
  })
  @IsString({ message: CommonMethods.getErrorMsgCombinedString('USR_1003') })
  @IsNotEmpty({ message: CommonMethods.getErrorMsgCombinedString('USR_1004') })
  name: string;

  @ApiProperty({
    example: 'Manager',
    description: 'Designation of the user',
    required: false,
  })
  @IsOptional()
  @IsString({ message: CommonMethods.getErrorMsgCombinedString('USR_1005') })
  designation?: string;

  @ApiProperty({
    example: '9999999999',
    description: 'Unique phone number of the user',
  })
  @IsString({ message: CommonMethods.getErrorMsgCombinedString('USR_1004') })
  @IsNotEmpty({ message: CommonMethods.getErrorMsgCombinedString('USR_1006') })
  phone: string;

  @ApiProperty({
    description: 'Password of the user',
    minLength: 8,
    example: 'StrongPass1@',
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
  password: string;

  @ApiProperty({
    example: 'HR',
    description: 'Department of the user',
    required: false,
  })
  @IsOptional()
  @IsString({ message: CommonMethods.getErrorMsgCombinedString('USR_1011') })
  dept?: string;

  @ApiProperty({
    example: 'https://example.com/visitor-image.jpg',
    description: 'URL of the user image',
    required: false,
  })
  @IsString({ message: CommonMethods.getErrorMsgCombinedString('USR_1017') })
  @IsOptional()
  image?: string;
}
