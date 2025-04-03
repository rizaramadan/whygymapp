import { Injectable } from '@nestjs/common';

export interface MemberData {
  gender: 'male' | 'female';
  duration: '90' | '180' | '360';
}

@Injectable()
export class MemberPricingService {
  private static readonly priceMap: {
    [key in 'normal' | 'promo']: {
      [key in 'single' | 'duo' | 'group']: {
        [key in 'male' | 'female']: {
          [key in '90' | '180' | '360']: number;
        };
      };
    };
  } = {
    normal: {
      single: {
        male: {
          '90': 590000,
          '180': 1200000,
          '360': 1950000,
        },
        female: {
          '90': 1100000,
          '180': 2150000,
          '360': 4000000,
        },
      },
      duo: {
        male: {
          '90': 540000,
          '180': 1050000,
          '360': 1750000,
        },
        female: {
          '90': 1000000,
          '180': 2000000,
          '360': 3800000,
        },
      },
      group: {
        male: {
          '90': 540000,
          '180': 1050000,
          '360': 1750000,
        },
        female: {
          '90': 850000,
          '180': 1700000,
          '360': 3000000,
        },
      },
    },
    promo: {
      single: {
        male: {
          '90': 590000,
          '180': 1200000,
          '360': 1950000,
        },
        female: {
          '90': 1100000,
          '180': 2150000,
          '360': 4000000,
        },
      },
      duo: {
        male: {
          '90': 540000,
          '180': 1050000,
          '360': 1750000,
        },
        female: {
          '90': 1000000,
          '180': 2000000,
          '360': 3800000,
        },
      },
      group: {
        male: {
          '90': 540000,
          '180': 1050000,
          '360': 1750000,
        },
        female: {
          '90': 850000,
          '180': 1700000,
          '360': 3000000,
        },
      },
    },
  };

  getSinglePrice(
    priceType: 'normal' | 'promo',
    gender: 'male' | 'female',
    duration: '90' | '180' | '360',
  ): number {
    return (
      MemberPricingService.priceMap[priceType]['single'][gender][duration] /
      parseInt(process.env.PRICE_DIVISOR ?? '1')
    );
  }

  calculateTotalPrice(memberData: MemberData[]): number {
    const priceType = 'promo';
    //extract if member is single, duo, or group
    //if member is more than 5, then single is used

    //numbers female members
    const femaleMembers = memberData.filter(
      (member) => member.gender === 'female',
    ).length;

    const groupType =
      memberData.length === 1 ? 'single' : femaleMembers >= 5 ? 'group' : 'duo';

    const total = memberData.reduce((acc, curr) => {
      const gender = curr.gender || 'female';
      const duration = curr.duration || '360';

      if (
        !MemberPricingService.priceMap[priceType]?.[groupType]?.[gender]?.[
          duration
        ]
      ) {
        throw new Error('Invalid price parameters');
      }

      const price = String(
        MemberPricingService.priceMap[priceType][groupType][gender][duration],
      );
      return acc + parseFloat(price);
    }, 0);

    return total / parseInt(process.env.PRICE_DIVISOR ?? '1');
  }
}
