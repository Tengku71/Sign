import { Test, TestingModule } from '@nestjs/testing';
import { TrialResultsService } from './trial-results.service';

describe('TrialResultsService', () => {
  let service: TrialResultsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TrialResultsService],
    }).compile();

    service = module.get<TrialResultsService>(TrialResultsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
