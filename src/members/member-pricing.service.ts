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
  private static readonly specialEmails = [
    'tikafathul@gmail.com',
    'triyulyanti29@gmail.com',
    'dinatharifah@gmail.com',
    'amaniatik@gmail.com',
    'riza.ramadan+yukngaji@gmail.com',
    'riza.ramadan+yukngaji@gagasimaji.com'
  ];

  private static readonly priceMap: {
    [key in 'normal' | 'promo' | 'weekendOnly' | 'yukngaji']: {
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
    weekendOnly: {
      single: {
        male: {
          '90': 590000,
          '180': 1200000,
          '360': 1950000,
        },
        female: {
          '90': 750000,
          '180': 1440000,
          '360': 2640000,
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
    yukngaji: {
      single: {
        male: {
          '90': 390000,
          '180': 500000,
          '360': 800000,
        },
        female: {
          '90': 850000,
          '180': 1600000,
          '360': 2800000,
        },
      },
      duo: {
        male: {
          '90': 590000,
          '180': 1200000,
          '360': 1950000,
        },
        female: {
          '90': 850000,
          '180': 1600000,
          '360': 2800000,
        },
      },
      group: {
        male: {
          '90': 390000, 
          '180': 500000,
          '360': 800000,
        },
        female: {
          '90': 850000,
          '180': 1600000,
          '360': 2800000,
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

    if (MemberPricingService.specialEmails.includes(email)) {
      return (
        MemberPricingService.priceMap['yukngaji']['single'][gender][duration] /
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

      const price = MemberPricingService.specialEmails.includes(curr.email) ?
      String(
        MemberPricingService.priceMap['yukngaji'][groupType][gender][duration] 
      ):
      String(
        MemberPricingService.priceMap[priceType][groupType][gender][duration],
      );

      return acc + parseFloat(price);
    }, 0);

    return total / parseInt(process.env.PRICE_DIVISOR ?? '1');
  }
}
