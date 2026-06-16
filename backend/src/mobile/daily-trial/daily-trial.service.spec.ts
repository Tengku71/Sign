import { Test, TestingModule } from '@nestjs/testing';
import { DailyTrialService } from './daily-trial.service';

describe('DailyTrialService', () => {
  let service: DailyTrialService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DailyTrialService],
    }).compile();

    service = module.get<DailyTrialService>(DailyTrialService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
