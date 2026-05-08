import { IsNotEmpty } from 'class-validator';

export class CreateMateriDto {
  @IsNotEmpty()
  label!: string;
}
