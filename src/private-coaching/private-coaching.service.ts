import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { Inject } from '@nestjs/common';
import { User } from '../users/users.service';
import {
  createPrivateCoachingOrder,
  CreatePrivateCoachingOrderRow,
  createDuoPrivateCoachingOrder,
  CreateDuoPrivateCoachingOrderRow,
} from '../../db/src/query_sql';
import { MembersService } from '../members/members.service';

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

export interface PrivateCoachingApplyDto {
  coachType: CoachType;
  sessionCount: SessionPackage;
  trainingType: SessionType;
  partnerEmail: string;
  termsAgree: string;
  riskAgree: string;
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

  constructor(
    @Inject('DATABASE_POOL') private pool: Pool,
    private readonly membersService: MembersService,
  ) {}

  calculateTotalPrice(
    coachType: CoachType,
    sessionType: SessionType,
    sessionPackage: SessionPackage,
  ): number {
    console.log(coachType, sessionType, sessionPackage);
    return (
      PrivateCoachingService.priceMap[coachType][sessionType][sessionPackage] /
      parseInt(process.env.PRICE_DIVISOR ?? '1')
    );
  }

  async apply(
    body: PrivateCoachingApplyDto,
    user: User,
  ): Promise<CreatePrivateCoachingOrderRow | null> {
    const member = await this.membersService.getMemberIdByEmail(user.email);
    if (!member || member.membershipStatus !== 'active') {
      throw new Error('Member inactive or not found');
    }

    let partnerId: number | null = null;
    if (body.partnerEmail) {
      const partner = await this.membersService.getMemberIdByEmail(
        body.partnerEmail,
      );
      if (!partner || partner.membershipStatus !== 'active') {
        throw new Error('Partner inactive or not found');
      }
      partnerId = partner.id;
    }

    console.log(body);

    if (body.trainingType === 'duo') {
      const result = await createDuoPrivateCoachingOrder(this.pool, {
        email: user.email,
        memberId: member.id,
        coachType: body.coachType,
        numberOfSessions: parseInt(body.sessionCount),
        additionalData: body,
        emailPartner: body.partnerEmail,
        memberIdPartner: partnerId || 0,
        price: this.calculateTotalPrice(
          body.coachType,
          body.trainingType,
          body.sessionCount,
        ).toString(),
      });
      if (result) {
        return {
          id: result[0].id,
          mainReferenceId: result[0].mainReferenceId,
          partId: result[0].partId,
          notes: result[0].notes,
        };
      } else {
        throw new Error('Failed to create duo private coaching order');
      } 
    } else {
      return await createPrivateCoachingOrder(this.pool, {
        email: user.email,
        memberId: member.id,
        coachType: body.coachType,
        numberOfSessions: parseInt(body.sessionCount),
        additionalData: body,
        price: this.calculateTotalPrice(
          body.coachType,
          body.trainingType,
          body.sessionCount,
        ).toString(),
      });
    }
  }
}
