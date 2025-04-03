import { Injectable } from '@nestjs/common';
import { group } from 'console';

export interface MemberData {
  gender: 'male' | 'female';
  duration: '90' | '180' | '360';
}

@Injectable()
export class MemberPricingService {
  private static readonly priceMap: {
    [key in 'normal' | 'discount']: {
      [key in 'male' | 'female']: {
        [key in '90' | '180' | '360']: number;
      };
    };
  } = {
    normal: {
      male: {
        '90': 605000,
        '180': 1185000,
        '360': 2250000,
      },
      female: {
        '90': 1331000,
        '180': 2601500,
        '360': 4840000,
      },
    },
    discount: {
      male: {
        '90': 550000,
        '180': 1089000,
        '360': 1936000,
      },
      female: {
        '90': 1210000,
        '180': 2365000,
        '360': 4400000,
      },
    },
  };

  getSinglePrice(
    priceType: 'normal' | 'discount',
    gender: 'male' | 'female',
    duration: '90' | '180' | '360',
  ): number {
    return (
      MemberPricingService.priceMap[priceType][gender][duration] /
      parseInt(process.env.PRICE_DIVISOR ?? '1')
    );
  }

  calculateTotalPrice(memberData: MemberData[]): number {
    const priceType = 'normal';
    //extract if member is single, duo, or group
    let groupType =
      memberData.length === 1
        ? 'single'
        : memberData.length === 5
          ? 'group'
          : 'duo'; //if members not 5, then duo pricing is used

    const hasFemale = memberData.some((member) => member.gender === 'female');
    if (!hasFemale && groupType === 'group') {
      groupType = 'duo';
    }

    const total = memberData.reduce((acc, curr) => {
      const gender = curr.gender || 'female';
      const duration = curr.duration || '360';

      if (!MemberPricingService.priceMap[priceType]?.[gender]?.[duration]) {
        throw new Error('Invalid price parameters');
      }

      const price = String(
        MemberPricingService.priceMap[priceType][gender][duration],
      );
      return acc + parseFloat(price);
    }, 0);

    return total / parseInt(process.env.PRICE_DIVISOR ?? '1');
  }
}
