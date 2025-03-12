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
  createMemberByUsername,
  CreateMemberByUsernameRow,
  createMemberByEmail,
} from 'db/src/query_sql';
import { Pool } from 'pg';
import { MembershipApplicationDto } from './dto/membership-application.dto';
import { User } from 'src/users/users.service';

@Injectable()
export class MembersService {
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

  async processMembershipApplication(
    user: User,
    applicationData: MembershipApplicationDto,
  ): Promise<CreateMemberByUsernameRow | null> {
    try {
      // Convert date string to Date object
      const dateOfBirth = new Date(applicationData.dateOfBirth);

      // Prepare additional data to store as JSON
      const additionalData = {
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

      // Create member using the provided function
      const member = await createMemberByEmail(this.pool, {
        email: user.email || user.username,
        nickname: applicationData.nickname,
        dateOfBirth: dateOfBirth,
        phoneNumber: applicationData.wa,
        membershipStatus: 'PENDING',
        additionalData: additionalData,
        notes: user.email ? user.email : 'username in email field',
      });

      return member;
    } catch (error) {
      console.error('Error processing membership application:', error);
      return null;
    }
  }
}
