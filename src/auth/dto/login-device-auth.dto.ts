import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CommonMethods } from 'src/commons/utils/common-methods';

export class LoginDeviceAuthDto {
  @ApiProperty()
  @IsNotEmpty({ message: CommonMethods.getErrorMsgCombinedString('usr_1004') })
  @IsString()
  userName: string;

  @ApiProperty({
    description: 'Password of the user',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty({ message: CommonMethods.getErrorMsgCombinedString('usr_1006') })
  password: string;

  @ApiProperty({ description: 'APK Name' })
  @IsOptional()
  @IsString()
  apkName: string;

  @ApiProperty({ description: 'Serial Number' })
  @IsOptional()
  @IsString()
  serialNumber: string;

  @ApiProperty({ description: 'Manufacturer' })
  @IsOptional()
  @IsString()
  manufacturer: string;

  @ApiProperty({ description: 'Model Number' })
  @IsOptional()
  @IsString()
  modelNumber: string;

  @ApiProperty({ description: 'Plutus Terminal ID', required: false })
  @IsOptional()
  @IsString()
  plutusTerminalID?: string;

  @ApiProperty({ description: 'Device Serial Number' })
  @IsOptional()
  @IsString()
  deviceSerialNumber: string;

  @ApiProperty({ description: 'Partner Device Reference ID', required: false })
  @IsOptional()
  @IsString()
  partnerDeviceRefID?: string;
}
