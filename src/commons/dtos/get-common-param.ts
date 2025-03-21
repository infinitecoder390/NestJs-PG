import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { CommonMethods } from 'src/commons/utils/common-methods';

export class CommonParamDTO {
  @ApiProperty({ required: true })
  @IsUUID()
  @IsNotEmpty({ message: CommonMethods.getErrorMsgCombinedString('USR_1018') })
  user_id: string;
}
