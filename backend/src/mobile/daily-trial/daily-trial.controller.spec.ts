import { Test, TestingModule } from '@nestjs/testing';
import { DailyTrialController } from './daily-trial.controller';

describe('DailyTrialController', () => {
  let controller: DailyTrialController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DailyTrialController],
    }).compile();

    controller = module.get<DailyTrialController>(DailyTrialController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
