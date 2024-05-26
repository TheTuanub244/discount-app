import { Test, TestingModule } from '@nestjs/testing';
import { DiscountServiceService } from './discount-service.service';

describe('DiscountServiceService', () => {
  let service: DiscountServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DiscountServiceService],
    }).compile();

    service = module.get<DiscountServiceService>(DiscountServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
