import { Test, TestingModule } from '@nestjs/testing';
import { TrialResultsController } from './trial-results.controller';

describe('TrialResultsController', () => {
  let controller: TrialResultsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrialResultsController],
    }).compile();

    controller = module.get<TrialResultsController>(TrialResultsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
