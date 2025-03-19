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
  getOrderByReferenceId,
  getOrderByReferenceIdRow,
} from 'db/src/query_sql';
import { Pool } from 'pg';
import { MembershipApplicationDto } from './dto/membership-application.dto';
import { User } from 'src/users/users.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PaymentMethod, PaymentMethodsResponse } from './members.interfaces';
@Injectable()
export class MembersService {
  private readonly authApiUrl: string;
  private readonly apiKey: string;
  private static readonly priceMap: {
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

  constructor(
    @Inject('DATABASE_POOL') private readonly pool: Pool,
    private readonly httpService: HttpService,
  ) {
    this.authApiUrl = process.env.AUTH_API_URL || 'https://authapi.com';
    this.apiKey = process.env.API_KEY || '1234567890';
  }

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

  private createMemberParams(
    user: User,
    applicationData: MembershipApplicationDto,
    additionalData: ReturnType<typeof this.createAdditionalData>,
  ) {
    return {
      email: user.email || user.username,
      nickname: applicationData.nickname,
      dateOfBirth: new Date(applicationData.dateOfBirth),
      phoneNumber: applicationData.wa,
      membershipStatus: 'PENDING' as const,
      additionalData,
      notes: user.email ? user.email : 'username in email field',
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

  async getOrderByReferenceId(
    referenceId: string,
  ): Promise<getOrderByReferenceIdRow | null> {
    return await getOrderByReferenceId(this.pool, { referenceId });
  }

  async getPaymentMethods(price: number): Promise<{
    paymentMethod: PaymentMethod | undefined;
  }> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<PaymentMethodsResponse>(
          `${this.authApiUrl}/v1/payment/methods`,
          {
            amount: price,
          },
          {
            headers: {
              'x-api-key': this.apiKey,
            },
          },
        ),
      );
      //find payment method by code QRIS and retrieve the data
      const paymentMethod = response.data.data.find(
        (method) => method.code === 'QRIS',
      );
      // return response
      return { paymentMethod };
    } catch (error) {
      // handle error
      throw new Error('Failed to handle checkout' + error);
    }
  }

  async createDarisiniInvoice(user: User, referenceId: string, method: string) {
    const order = await this.getOrderByReferenceId(referenceId);
    //const paymentMethod = await this.getPaymentMethods(order.price);
    //const paymentMethod = paymentMethod.paymentMethod;
    //const paymentGatewayFee = paymentMethod.paymentGatewayFee;
  }
}

