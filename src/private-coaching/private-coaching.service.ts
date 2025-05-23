import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { Inject } from '@nestjs/common';
import { User } from '../users/users.service';
import {
  createPrivateCoachingOrder,
  CreatePrivateCoachingOrderRow,
} from '../../db/src/query_sql';
import {
  createDuoPrivateCoachingOrder,
  CreateDuoPrivateCoachingOrderRow,
} from '../../db/volatile/volatile_sql';
import { MembersService } from '../members/members.service';


export type SessionStatus = 'pending' | 'scheduled' | 'completed' | 'cancelled';

export interface CoachingSession {
  id: number;
  member_id: number;
  coach_type: string;
  session_type: string;
  session_package: string;
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
  coach_type: string;
  session_type: string;
  session_package: string;
  price: string;
  status: string;
  additional_info?: Record<string, any>;
}

export interface CoachingMemberData {
  gender: 'male' | 'female';
}

export interface PrivateCoachingApplyDto {
  coachType: string;
  sessionCount: string;
  trainingType: string;
  partnerEmail: string;
  termsAgree: string;
  riskAgree: string;
}

@Injectable()
export class PrivateCoachingService {
  public static readonly priceMap: {
    [key in string]: {
      [key in string]: {
        [key in string]: number;
      };
    };
  } = {
    sherly:{
      single: {
        '1': 798000,
        '1 online' : 598000,
      },
    },
    nina: {
      single: {
        '1': 598000,
        '4': 2300000,
        '8': 4400000,
        '12': 6300000,
      },
      duo: {
        '1': 1050000,
        '4': 4000000,
        '8': 7600000,
        '12': 10800000,
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
    coachType: string,
    sessionType: string,
    sessionPackage: string,
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
