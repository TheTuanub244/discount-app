import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsNotEmptyObject,
  IsObject,
  ValidateNested,
  ValidateIf,
} from 'class-validator';
import { CombinesWithDto } from '../level-1/create-combinesWith.dto';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class BasicDetailDto {
  @ValidateNested()
  @IsObject()
  @IsNotEmptyObject()
  @Type(() => CombinesWithDto)
  combinesWith?: CombinesWithDto;
  @ApiProperty({ required: false })
  @ValidateIf(
    (o, value) => value !== null && value !== undefined && value !== '',
  )
  @IsBoolean()
  appliesOncePerCustomer: boolean;
  @IsString()
  @ApiProperty({ required: false })
  @ValidateIf(
    (o, value) => value !== null && value !== undefined && value !== '',
  )
  code: string;
  @IsNumber()
  @ApiProperty({ required: false })
  @ValidateIf(
    (o, value) => value !== null && value !== undefined && value !== '',
  )
  usageLimit: number;
  @IsString()
  @IsNotEmpty()
  title: string;
  startsAt: string;
  @ApiProperty({ required: false })
  @ValidateIf(
    (o, value) => value !== null && value !== undefined && value !== '',
  )
  endsAt: string;
  @ApiProperty({ required: false })
  @ValidateIf(
    (o, value) => value !== null && value !== undefined && value !== '',
  )
  usePerOrderLimit: number;
}
