import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateIf } from 'class-validator';

export class DiscountCollectionsInputDto {
  @IsArray()
  @ApiProperty({ required: false })
  @ValidateIf(
    (o, value) => value !== null && value !== undefined && value !== '',
  )
  add: Array<string>;
  @IsArray()
  @ApiProperty({ required: false })
  @ValidateIf(
    (o, value) => value !== null && value !== undefined && value !== '',
  )
  remove: Array<string>;
}
