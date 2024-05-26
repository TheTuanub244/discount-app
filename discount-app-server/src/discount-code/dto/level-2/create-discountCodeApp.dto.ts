import {
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { MetafielDto } from '../level-1/create-metafield.dto';
import { BasicDetailDto } from './create-basicDetail.dto';
import { Type } from 'class-transformer';

export class DiscountCodeAppDto {
  @ValidateNested()
  @IsObject()
  @IsNotEmptyObject()
  @Type(() => MetafielDto)
  metafield: MetafielDto;
  @ValidateNested()
  @IsObject()
  @IsNotEmptyObject()
  @Type(() => BasicDetailDto)
  basicDetail: BasicDetailDto;
}
