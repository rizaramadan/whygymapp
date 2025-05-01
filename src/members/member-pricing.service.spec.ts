import { MemberPricingService } from './member-pricing.service';
import { setupTest } from '../test/setup';

describe('MemberPricingService', () => {
  let service: MemberPricingService;

  beforeEach(() => {
    setupTest();
    service = new MemberPricingService();
  });

  describe('getSinglePrice', () => {
    it('should return correct price for male with normal price type', () => {
      const price = service.getSinglePrice('normal', 'male', '90', false, 'test@example.com');
      expect(price).toBeDefined();
      expect(typeof price).toBe('number');
    });

    it('should return correct price for female with normal price type', () => {
      const price = service.getSinglePrice('normal', 'female', '90', false, 'test@example.com');
      expect(price).toBeDefined();
      expect(typeof price).toBe('number');
    });

    
    it('should return same price for male regardless of weekend only option', () => {
      const priceWithWeekend = service.getSinglePrice('normal', 'male', '90', true, 'test@example.com');
      const priceWithoutWeekend = service.getSinglePrice('normal', 'male', '90', false, 'test@example.com');
      expect(priceWithWeekend).toBe(priceWithoutWeekend);
    });

    it('should handle different durations correctly', () => {
      const durations = ['90', '180', '360'] as const;
      durations.forEach(duration => {
        const price = service.getSinglePrice('normal', 'female', duration, false, 'test@example.com');
        expect(price).toBeDefined();
        expect(typeof price).toBe('number');
      });
    });

    it('should handle promo price type correctly', () => {
      const price = service.getSinglePrice('promo', 'female', '90', false, 'test@example.com');
      expect(price).toBeDefined();
      expect(typeof price).toBe('number');
    });

    it('should apply price divisor from environment variable', () => {
      const originalDivisor = process.env.PRICE_DIVISOR;
      process.env.PRICE_DIVISOR = '2';
      
      const price = service.getSinglePrice('normal', 'female', '90', false, 'test@example.com');
      expect(price).toBeDefined();
      
      process.env.PRICE_DIVISOR = originalDivisor;
    });

    it('should return correct price for special emails', () => {
      const price = service.getSinglePrice('normal', 'male', '180', false, 'riza.ramadan+yukngaji@gmail.com');
      expect(price).toBeDefined();
      expect(price).toBe(500000);
      expect(typeof price).toBe('number');
    });

    it('should return correct price for calculate total price', () => {
      const price = service.calculateTotalPrice([
        { gender: 'female', duration: '180', email: 'tikafathul@gmail.com' },
        { gender: 'female', duration: '180', email: 'triyulyanti29@gmail.com' },
        { gender: 'female', duration: '180', email: 'dinatharifah@gmail.com' },
      ]);
      expect(price).toBeDefined();
      expect(typeof price).toBe('number');
      expect(price).toBe(4800000);
    });
  });
}); 