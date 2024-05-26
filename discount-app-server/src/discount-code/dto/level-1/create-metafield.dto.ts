import { IsNotEmpty, IsString } from 'class-validator';

export class MetafielDto {
  @IsString()
  @IsNotEmpty()
  description: string;
  @IsString()
  @IsNotEmpty()
  id: string;
  @IsString()
  @IsNotEmpty()
  key: string;
  @IsString()
  @IsNotEmpty()
  namespace: string;
  @IsString()
  @IsNotEmpty()
  type: string;
  @IsString()
  @IsNotEmpty()
  value: string;
}
