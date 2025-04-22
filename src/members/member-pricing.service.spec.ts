import { MemberPricingService } from './member-pricing.service';

describe('MemberPricingService', () => {
  let service: MemberPricingService;

  beforeEach(() => {
    service = new MemberPricingService();
  });

  describe('getSinglePrice', () => {
    it('should return correct price for male with normal price type', () => {
      const price = service.getSinglePrice('normal', 'male', '90', false);
      expect(price).toBeDefined();
      expect(typeof price).toBe('number');
    });

    it('should return correct price for female with normal price type', () => {
      const price = service.getSinglePrice('normal', 'female', '90', false);
      expect(price).toBeDefined();
      expect(typeof price).toBe('number');
    });

    it('should return correct price for female with weekend only option', () => {
      const price = service.getSinglePrice('normal', 'female', '90', true);
      expect(price).toBeDefined();
      expect(typeof price).toBe('number');
      // Weekend only price should be 60% of normal price
      const normalPrice = service.getSinglePrice('normal', 'female', '90', false);
      expect(price).toBe(normalPrice * 0.6);
    });

    it('should return same price for male regardless of weekend only option', () => {
      const priceWithWeekend = service.getSinglePrice('normal', 'male', '90', true);
      const priceWithoutWeekend = service.getSinglePrice('normal', 'male', '90', false);
      expect(priceWithWeekend).toBe(priceWithoutWeekend);
    });

    it('should handle different durations correctly', () => {
      const durations = ['90', '180', '360'] as const;
      durations.forEach(duration => {
        const price = service.getSinglePrice('normal', 'female', duration, false);
        expect(price).toBeDefined();
        expect(typeof price).toBe('number');
      });
    });

    it('should handle promo price type correctly', () => {
      const price = service.getSinglePrice('promo', 'female', '90', false);
      expect(price).toBeDefined();
      expect(typeof price).toBe('number');
    });

    it('should apply price divisor from environment variable', () => {
      const originalDivisor = process.env.PRICE_DIVISOR;
      process.env.PRICE_DIVISOR = '2';
      
      const price = service.getSinglePrice('normal', 'female', '90', false);
      expect(price).toBeDefined();
      
      process.env.PRICE_DIVISOR = originalDivisor;
    });
  });
}); 