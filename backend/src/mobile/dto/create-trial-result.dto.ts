import { IsNumber, IsDateString } from 'class-validator';

export class CreateTrialResultDto {
  @IsNumber()
  materiId!: number;

  @IsNumber()
  correct!: number;

  @IsNumber()
  wrong!: number;

  @IsNumber()
  total!: number;

  @IsDateString()
  completedAt!: string;
}
