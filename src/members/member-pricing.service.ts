import { Injectable } from '@nestjs/common';

export interface MemberData {
  gender: 'male' | 'female';
  duration: '90' | '180' | '360';
  email: string;
}

/**
 * tikafathul@gmail.com
 * triyulyanti29@gmail.com
 * dinatharifah@gmail.com
 * amaniatik@gmail.com
 * 
 * 
 */

@Injectable()
export class MemberPricingService {
  private static readonly priceMap: {
    [key in 'normal' | 'promo' | 'weekendOnly']: {
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
          '90': 740000,
          '180': 1440000,
          '360': 2440000,
        },
        female: {
          '90': 1150000,
          '180': 2230000,
          '360': 4100000,
        },
      },
      duo: {
        male: {
          '90': 690000,
          '180': 1290000,
          '360': 2090000,
        },
        female: {
          '90': 1080000,
          '180': 2100000,
          '360': 3920000,
        },
      },
      group: {
        male: {
          '90': 690000,
          '180': 1290000,
          '360': 2090000,
        },
        female: {
          '90': 990000,
          '180': 1990000,
          '360': 3500000,
        },
      },
    },
    promo: {
      single: {
        male: {
          '90': 740000,
          '180': 1440000,
          '360': 2440000,
        },
        female: {
          '90': 1150000,
          '180': 2230000,
          '360': 4100000,
        },
      },
      duo: {
        male: {
          '90': 690000,
          '180': 1290000,
          '360': 2090000,
        },
        female: {
          '90': 1080000,
          '180': 2100000,
          '360': 3920000,
        },
      },
      group: {
        male: {
          '90': 690000,
          '180': 1290000,
          '360': 2090000,
        },
        female: {
          '90': 990000,
          '180': 1990000,
          '360': 3500000,
        },
      },
    },
    weekendOnly: {
      single: {
        male: {
          '90': 740000,
          '180': 1440000,
          '360': 2440000,
        },        
        female: {
          '90': 690000,
          '180': 1350000,
          '360': 2450000,
        },
      },
      duo: {
        male: {
          '90': 740000,
          '180': 1440000,
          '360': 2440000,
        },        
        female: {
          '90': 690000,
          '180': 1350000,
          '360': 2450000,
        },
      },
      group: {
        male: {
          '90': 740000,
          '180': 1440000,
          '360': 2440000,
        },        
        female: {
          '90': 690000,
          '180': 1350000,
          '360': 2450000,
        },
      },
    },
  };

  getSinglePrice(
    priceType: 'normal' | 'promo' | 'weekendOnly' | 'yukngaji',
    gender: 'male' | 'female',
    duration: '90' | '180' | '360',
    weekendOnly: boolean,
    email: string,
  ): number {


    //only female can have weekendOnly, and only single can have weekendOnly
    if (gender === 'female' && weekendOnly) {
      return (
        MemberPricingService.priceMap['weekendOnly']['single']['female'][duration] /
        parseInt(process.env.PRICE_DIVISOR ?? '1')
      );
    }

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
