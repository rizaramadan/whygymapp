import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { Inject } from '@nestjs/common';

export interface CoachingMemberData {
  gender: 'male' | 'female';
}

@Injectable()
export class PrivateCoachingService {
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


  constructor(@Inject('DATABASE_POOL') private pool: Pool) {}

  calculateTotalPrice(memberData: CoachingMemberData[]): number {
    return memberData.length * 100;
  }
}
