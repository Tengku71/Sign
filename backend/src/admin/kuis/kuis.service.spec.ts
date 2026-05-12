import { Test, TestingModule } from '@nestjs/testing';
import { KuisService } from './kuis.service';

describe('KuisService', () => {
  let service: KuisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KuisService],
    }).compile();

    service = module.get<KuisService>(KuisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
