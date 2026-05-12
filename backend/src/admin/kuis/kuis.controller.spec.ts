import { Test, TestingModule } from '@nestjs/testing';
import { KuisController } from './kuis.controller';

describe('KuisController', () => {
  let controller: KuisController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KuisController],
    }).compile();

    controller = module.get<KuisController>(KuisController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
