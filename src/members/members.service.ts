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
  getActiveMemberBreakdown,
  getActiveMemberBreakdownRow,
  linkGroupOrder,
  getMemberActiveDate,
  getMemberActiveDateRow,
  getMemberById,
  GetMemberByIdRow,
  updateMemberPrice,
  getAccountingDataRow,
  getAccountingData,
  getMemberDurationData,
  getMemberDurationDataRow,
  getAccountingDataPrivateCoachingRow,
  getAccountingDataPrivateCoaching,
} from 'db/src/query_sql';
import {
  updateMemberAdditionalData,
  addOrUpdateMemberPicUrl,
  addOrUpdateMemberPicUrlRow,
} from 'db/volatile/volatile_sql';
import { Pool } from 'pg';
import { MembershipApplicationDto } from './dto/membership-application.dto';
import { User } from 'src/users/users.service';
import { MemberPricingService } from './member-pricing.service';

@Injectable()
export class MembersService {
  private readonly MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000;

  constructor(
    @Inject('DATABASE_POOL') private pool: Pool,
    private readonly memberPricingService: MemberPricingService,
  ) {}

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
      weekendOnly: applicationData.weekendOnly || false,
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

      const price = String(
        this.memberPricingService.getSinglePrice(priceType, gender, duration, additionalData.weekendOnly, user.email || ''),
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
      await linkGroupOrder(this.pool, { id: member?.partId || 0 });

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

  async getMemberIdByEmail(email: string) {
    return await getMemberIdByEmail(this.pool, { email });
  }

  async updateMemberAdditionalData(
    id: number,
    email: string,
    emailPic: string,
    duration: string,
    gender: string,
  ) {

    const member = await getMemberIdByEmail(this.pool, { email });
    if (!member) {
      return null;
    }

    const result = await updateMemberAdditionalData(this.pool, {
      id,
      email,
      emailPic,
      duration,
      gender,
    });

    const priceType = 'normal';
    const theDuration = duration as '90' | '180' | '360';
    const theGender = gender.toLowerCase() as 'male' | 'female';

    const price = String(
      this.memberPricingService.getSinglePrice(
        priceType, 
        theGender, 
        theDuration, 
        member.additionalData?.weekendOnly ?? false,
        member.email ?? ''
      ),
    );

    console.log(price);

    await updateMemberPrice(this.pool, {
      id: member.id,
      price,
    });

    return result;
  }

  async getActiveMemberBreakdown(): Promise<getActiveMemberBreakdownRow[]> {
    const data = await getActiveMemberBreakdown(this.pool);
    return data;
  }

  async getMemberActiveDate(
    email: string,
  ): Promise<getMemberActiveDateRow | null> {
    const data = await getMemberActiveDate(this.pool, { email });
    if (!data || !data.startDate) {
      return null;
    }

    const duration = await this.getMemberDurationData(data.id);
    data.endDate = new Date(data.startDate.getTime() + duration * this.MILLISECONDS_IN_DAY);
    return data;
  }

  async addOrUpdateMemberPicUrl(
    email: string,
    picUrl: string,
  ): Promise<addOrUpdateMemberPicUrlRow | null> {
    return await addOrUpdateMemberPicUrl(this.pool, { email, picUrl });
  }

  async getMemberById(id: number): Promise<GetMemberByIdRow | null> {
    return await getMemberById(this.pool, { id });
  }

  async getAccountingData(): Promise<getAccountingDataRow[]> {
    return await getAccountingData(this.pool);
  }

  async getAccountingDataPrivateCoaching(): Promise<getAccountingDataPrivateCoachingRow[]> {
    return await getAccountingDataPrivateCoaching(this.pool);
  }

  async getMemberDurationData(id: number) {
    const durationData = await getMemberDurationData(this.pool, { id });
    const totalDuration = this.calculateTotalDuration(durationData);
    return totalDuration;
  }

  calculateTotalDuration(members: getMemberDurationDataRow[]): number {
    let total = parseInt(members[0].baseDuration || '0');
    
    // Add extension days only first row
    if (members[0].extend15 === 'true') total += 15;
    if (members[0].extend30 === 'true') total += 30;
    if (members[0].extend60 === 'true') total += 60;
    
    // Add extra time from all rows 
    for (const member of members) {
      if (member.extraTime) total += member.extraTime;
    }
    
    return total;
  }
}
