import { IsNotEmpty, IsInt } from 'class-validator';

export class CreateQuestionDto {
  @IsNotEmpty()
  options: any;

  @IsInt()
  modeId!: number;
}
