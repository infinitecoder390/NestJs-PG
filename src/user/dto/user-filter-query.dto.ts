import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { FilterQueryDto } from 'src/commons/dtos/filter-query.dto';
import { FindOperator } from 'typeorm';

export class UserFilterQueryDto extends FilterQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string | FindOperator<string>;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  entity_id?: string | FindOperator<string>;
}
