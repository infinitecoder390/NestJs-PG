import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { CommonMethods } from 'src/commons/utils/common-methods';

export class PermissionEntityObj {
  @ApiProperty({ description: 'Organization Id' })
  @IsNotEmpty({ message: CommonMethods.getErrorMsgCombinedString('ODR_2068') })
  orgId?: string;
}
export class CreateUserRoleDto {
  @ApiProperty()
  @IsNotEmpty({
    message: CommonMethods.getErrorMsgCombinedString('usr_roles_1001'),
  })
  user_id: string;

  @ApiProperty()
  @IsNotEmpty({
    message: CommonMethods.getErrorMsgCombinedString('usr_prms_1002'),
  })
  role_id: string;
}
