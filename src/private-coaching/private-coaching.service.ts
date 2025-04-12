import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { Inject } from '@nestjs/common';

export type CoachType = 'head_coach' | 'coach';
export type SessionType = 'single' | 'duo';
export type SessionPackage = '1' | '4' | '8' | '12';
export type SessionStatus = 'pending' | 'scheduled' | 'completed' | 'cancelled';

export interface CoachingSession {
  id: number;
  member_id: number;
  coach_type: CoachType;
  session_type: SessionType;
  session_package: SessionPackage;
  remaining_sessions: number;
  status: SessionStatus;
  created_at: Date;
  updated_at: Date;
  additional_info?: Record<string, any>;
}

export interface GroupCoachingSession extends CoachingSession {
  group_id: string;
  group_members: number[];
}

export interface CoachingOrder {
  reference_id: string;
  member_id: number;
  coach_type: CoachType;
  session_type: SessionType;
  session_package: SessionPackage;
  price: string;
  status: string;
  additional_info?: Record<string, any>;
}

export interface CoachingMemberData {
  gender: 'male' | 'female';
}

@Injectable()
export class PrivateCoachingService {
  private static readonly priceMap: {
    [key in CoachType]: {
      [key in SessionType]: {
        [key in SessionPackage]: number;
      };
    };
  } = {
    head_coach: {
      single: {
        '1': 498000,
        '4': 1900000,
        '8': 3600000,
        '12': 5100000,
      },
      duo: {
        '1': 850000,
        '4': 3200000,
        '8': 6000000,
        '12': 8400000,
      },
    },
    coach: {
      single: {
        '1': 398000,
        '4': 1500000,
        '8': 2800000,
        '12': 3900000,
      },
      duo: {
        '1': 650000,
        '4': 2400000,
        '8': 4400000,
        '12': 6000000,
      },
    },
  };

  constructor(@Inject('DATABASE_POOL') private pool: Pool) {}

  calculateTotalPrice(
    coachType: CoachType,
    sessionType: SessionType,
    sessionPackage: SessionPackage,
  ): number {
    return PrivateCoachingService.priceMap[coachType][sessionType][
      sessionPackage
    ];
  }

  // ... rest of the existing methods ...
}
