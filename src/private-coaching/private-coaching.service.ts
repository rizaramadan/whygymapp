import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { Inject } from '@nestjs/common';

export type CoachType = 'personal' | 'group';
export type SessionStatus = 'pending' | 'scheduled' | 'completed' | 'cancelled';

export interface CoachingSession {
  id: number;
  member_id: number;
  coach_type: CoachType;
  number_of_sessions: number;
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
  number_of_sessions: number;
  price: string;
  status: string;
  additional_info?: Record<string, any>;
}

@Injectable()
export class PrivateCoachingService {
  constructor(
    @Inject('DATABASE_POOL') private pool: Pool,
  ) {}

  async createCoachingSession(
    memberId: number,
    coachType: CoachType,
    numberOfSessions: number,
    additionalInfo?: Record<string, any>,
  ): Promise<CoachingSession> {
    const query = `
      INSERT INTO coaching_sessions (
        member_id,
        coach_type,
        number_of_sessions,
        remaining_sessions,
        status,
        additional_info
      ) VALUES ($1, $2, $3, $3, 'pending', $4)
      RETURNING *
    `;

    const result = await this.pool.query(query, [
      memberId,
      coachType,
      numberOfSessions,
      additionalInfo ? JSON.stringify(additionalInfo) : null,
    ]);

    return result.rows[0];
  }

  async createGroupCoachingSession(
    memberId: number,
    numberOfSessions: number,
    groupMembers: number[],
    additionalInfo?: Record<string, any>,
  ): Promise<GroupCoachingSession> {
    const query = `
      INSERT INTO coaching_sessions (
        member_id,
        coach_type,
        number_of_sessions,
        remaining_sessions,
        status,
        group_id,
        group_members,
        additional_info
      ) VALUES ($1, 'group', $2, $2, 'pending', $3, $4, $5)
      RETURNING *
    `;

    const groupId = `group_${Date.now()}`;
    const result = await this.pool.query(query, [
      memberId,
      numberOfSessions,
      groupId,
      groupMembers,
      additionalInfo ? JSON.stringify(additionalInfo) : null,
    ]);

    return result.rows[0];
  }

  async getCoachingSessionById(id: number): Promise<CoachingSession | null> {
    const query = `
      SELECT * FROM coaching_sessions WHERE id = $1
    `;

    const result = await this.pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async getCoachingSessionsByMemberId(memberId: number): Promise<CoachingSession[]> {
    const query = `
      SELECT * FROM coaching_sessions WHERE member_id = $1
    `;

    const result = await this.pool.query(query, [memberId]);
    return result.rows;
  }

  async updateSessionStatus(
    sessionId: number,
    status: SessionStatus,
  ): Promise<CoachingSession> {
    const query = `
      UPDATE coaching_sessions
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;

    const result = await this.pool.query(query, [status, sessionId]);
    return result.rows[0];
  }

  async decrementRemainingSessions(sessionId: number): Promise<CoachingSession> {
    const query = `
      UPDATE coaching_sessions
      SET remaining_sessions = remaining_sessions - 1,
          updated_at = NOW()
      WHERE id = $1 AND remaining_sessions > 0
      RETURNING *
    `;

    const result = await this.pool.query(query, [sessionId]);
    return result.rows[0];
  }

  async getGroupCoachingSession(groupId: string): Promise<GroupCoachingSession | null> {
    const query = `
      SELECT * FROM coaching_sessions
      WHERE group_id = $1 AND coach_type = 'group'
    `;

    const result = await this.pool.query(query, [groupId]);
    return result.rows[0] || null;
  }

  async addMemberToGroupSession(
    groupId: string,
    memberId: number,
  ): Promise<GroupCoachingSession> {
    const query = `
      UPDATE coaching_sessions
      SET group_members = array_append(group_members, $1),
          updated_at = NOW()
      WHERE group_id = $2 AND coach_type = 'group'
      RETURNING *
    `;

    const result = await this.pool.query(query, [memberId, groupId]);
    return result.rows[0];
  }
}
