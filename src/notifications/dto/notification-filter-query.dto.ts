import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { FilterQueryDto } from 'src/commons/dtos/filter-query.dto';
import { FindOperator } from 'typeorm';

export class NotificationFilterQueryDto extends FilterQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  from_user_id?: string | FindOperator<string> | string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  to_user_id?: string | FindOperator<string> | string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  visitor_id?: string | FindOperator<string> | string[];
}
