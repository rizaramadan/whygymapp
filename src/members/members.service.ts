import { Inject, Injectable } from '@nestjs/common';
import {
  CreateVisitRow,
  getMemberIdByEmail,
  createVisit,
  GetVisitsAfterIdRow,
  getLastVisitId,
  GetLastVisitIdRow,
  getTodayVisits,
  getVisitsAfterId,
  deletePendingMembership,
  DeletePendingMembershipRow,
  GetPendingMembershipByEmailRow,
  getPendingMembershipByEmail,
  GetWeeklyVisitsByEmailRow,
  GetMonthlyVisitsByEmailRow,
  getWeeklyVisitsByEmail,
  getMonthlyVisitsByEmail,
  createMemberOrder,
  CreateMemberOrderRow,
  GetOrderReferenceIdByEmailRow,
  getOrderReferenceIdByEmail,
  GetActiveMembershipByEmailRow,
  getActiveMembershipByEmail,
  getPotentialGroupDataRow,
  getPotentialGroupDataArgs,
  getPotentialGroupData,
} from 'db/src/query_sql';
import { Pool } from 'pg';
import { MembershipApplicationDto } from './dto/membership-application.dto';
import { User } from 'src/users/users.service';

@Injectable()
export class MembersService {
  public static readonly priceMap: {
    [key in 'normal' | 'discount']: {
      [key in 'male' | 'female']: {
        [key in '90' | '180' | '360']: number;
      };
    };
  } = {
    normal: {
      male: {
        '90': 90,
        '180': 180,
        '360': 360,
      },
      female: {
        '90': 180,
        '180': 360,
        '360': 720,
      },
    },
    discount: {
      male: {
        '90': 80,
        '180': 170,
        '360': 350,
      },
      female: {
        '90': 160,
        '180': 320,
        '360': 640,
      },
    },
  };

  constructor(@Inject('DATABASE_POOL') private readonly pool: Pool) {}

  async createVisit(
    email: string,
    picUrl: string,
  ): Promise<CreateVisitRow | null> {
    const memberId = await getMemberIdByEmail(this.pool, { email });
    if (!memberId) {
      return null;
    }
    const visit = await createVisit(this.pool, {
      memberId: memberId.id,
      email: email,
      picUrl: picUrl,
    });
    return visit;
  }

  async getTodayVisitors(): Promise<GetVisitsAfterIdRow[]> {
    return await getTodayVisits(this.pool);
  }

  async getLastVisitId(): Promise<GetLastVisitIdRow | null> {
    return await getLastVisitId(this.pool);
  }

  async getNewVisitors(
    lastVisitId: string,
  ): Promise<GetVisitsAfterIdRow[] | null> {
    return await getVisitsAfterId(this.pool, { id: lastVisitId });
  }

  private createAdditionalData(applicationData: MembershipApplicationDto) {
    return {
      emailPic: applicationData.emailPic,
      fullName: applicationData.fullName,
      gender: applicationData.gender,
      address: applicationData.address,
      identityNumber: applicationData.identityNumber,
      healthCondition: applicationData.healthCondition,
      duration: applicationData.duration,
      parentInfo: applicationData.parentName
        ? {
            name: applicationData.parentName,
            identityNumber: applicationData.parentIdentityNumber,
            contact: applicationData.parentContact,
            consent: applicationData.underageConsent,
          }
        : null,
      agreements: {
        terms: applicationData.termsAgree,
        risk: applicationData.riskAgree,
        data: applicationData.dataAgree,
        rules: applicationData.rulesAgree,
      },
      frontOfficer: applicationData.frontOfficer,
    };
  }

  async processMembershipApplication(
    user: User,
    applicationData: MembershipApplicationDto,
  ): Promise<CreateMemberOrderRow | null> {
    try {
      const additionalData = this.createAdditionalData(applicationData);
      const priceType = 'normal';
      const duration = applicationData.duration as '90' | '180' | '360';
      const gender = additionalData.gender.toLowerCase() as 'male' | 'female';

      if (!MembersService.priceMap[priceType]?.[gender]?.[duration]) {
        throw new Error('Invalid price parameters');
      }

      const price = String(
        MembersService.priceMap[priceType][gender][duration],
      );

      const memberParams = {
        email: user.email || user.username,
        nickname: applicationData.nickname,
        dateOfBirth: new Date(applicationData.dateOfBirth),
        phoneNumber: applicationData.wa,
        notes: user.email ? user.email : 'username in email field',
        additionalData,
        price,
      };

      // Create member using the provided function
      const member = await createMemberOrder(this.pool, memberParams);

      return member;
    } catch (error) {
      console.error('Error processing membership application:', error);
      return null;
    }
  }

  async getPendingMembershipByEmail(
    email: string,
  ): Promise<GetPendingMembershipByEmailRow | null> {
    return await getPendingMembershipByEmail(this.pool, { email });
  }

  async getOrderReferenceIdByEmail(
    email: string,
  ): Promise<GetOrderReferenceIdByEmailRow | null> {
    return await getOrderReferenceIdByEmail(this.pool, { email });
  }

  async deletePendingMembership(
    id: number,
    email: string,
  ): Promise<DeletePendingMembershipRow | null> {
    return await deletePendingMembership(this.pool, { id, email });
  }

  async getWeeklyVisitsByEmail(
    email: string,
  ): Promise<GetWeeklyVisitsByEmailRow[]> {
    return await getWeeklyVisitsByEmail(this.pool, { email });
  }

  async getMonthlyVisitsByEmail(
    email: string,
  ): Promise<GetMonthlyVisitsByEmailRow[]> {
    return await getMonthlyVisitsByEmail(this.pool, { email });
  }

  async getActiveMembershipByEmail(
    email: string,
  ): Promise<GetActiveMembershipByEmailRow | null> {
    return await getActiveMembershipByEmail(this.pool, { email });
  }

  async getPotentialGroupData(email: string) {
    const args: getPotentialGroupDataArgs = { email };
    const result: getPotentialGroupDataRow[] | null =
      await getPotentialGroupData(this.pool, args);
    return result;
  }
}
