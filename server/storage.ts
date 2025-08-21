import { pool } from './db.js';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: 'member' | 'trainer' | 'admin';
  phone?: string;
  stripeSubscriptionId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface MembershipTier {
  id: string;
  name: string;
  price: number;
  features: string[];
  description: string;
}

interface MemberProfile {
  id: string;
  userId: string;
  membershipTierId: string;
  fitnessGoals: string;
  emergencyContact: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface TrainerProfile {
  id: string;
  userId: string;
  specializations: string[];
  hourlyRate: number;
  experienceYears: number;
  certifications: string;
  bio: string;
  isAvailable: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export const storage = {
  // User operations
  async createUser(userData: Omit<User, 'id'>): Promise<User> {
    const { rows } = await pool.query(
      'INSERT INTO users (email, first_name, last_name, user_type, phone, stripe_subscription_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [userData.email, userData.firstName, userData.lastName, userData.userType, userData.phone || null, userData.stripeSubscriptionId || null]
    );
    return this.mapUserFromDb(rows[0]);
  },

  async getUser(id: string): Promise<User | null> {
    try {
      const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
      const user = rows[0];
      if (user) {
        return {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          userType: user.user_type,
          first_name: user.first_name,
          last_name: user.last_name,
          user_type: user.user_type,
          phone: user.phone
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const { rows } = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      const user = rows[0];
      if (user) {
        return {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          userType: user.user_type,
          first_name: user.first_name,
          last_name: user.last_name,
          user_type: user.user_type,
          phone: user.phone
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  },

  async deleteUser(id: string): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // First check if user exists
      const userCheck = await client.query('SELECT * FROM users WHERE id = $1', [id]);
      if (userCheck.rows.length === 0) {
        throw new Error(`User with id ${id} not found`);
      }
      
      const user = userCheck.rows[0];
      console.log(`Deleting user: ${user.first_name} ${user.last_name} (${user.user_type})`);
      
      // Delete related records first (if they exist) - using user_id for profile tables
      await client.query('DELETE FROM member_profiles WHERE user_id = $1', [id]);
      await client.query('DELETE FROM trainer_profiles WHERE user_id = $1', [id]);
      
      // For other tables that might use the profile IDs, we need to handle them differently
      // But for now, let's just delete the user and let CASCADE handle it if set up
      
      // Finally delete the user
      const result = await client.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
      
      if (result.rows.length === 0) {
        throw new Error(`Failed to delete user with id ${id}`);
      }
      
      await client.query('COMMIT');
      console.log(`Successfully deleted user with id: ${id} (${user.first_name} ${user.last_name})`);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`Error deleting user ${id}:`, error);
      throw error;
    } finally {
      client.release();
    }
  },

  // Membership tier operations
  async getMembershipTiers(): Promise<MembershipTier[]> {
    const { rows } = await pool.query('SELECT * FROM membership_tiers ORDER BY price ASC');
    return rows.map(this.mapMembershipTierFromDb);
  },

  async getMembershipTier(id: string): Promise<MembershipTier | null> {
    const { rows } = await pool.query('SELECT * FROM membership_tiers WHERE id = $1', [id]);
    if (rows.length === 0) return null;
    return this.mapMembershipTierFromDb(rows[0]);
  },

  // Member profile operations
  async createMemberProfile(profileData: Omit<MemberProfile, 'id'>): Promise<MemberProfile> {
    const { rows } = await pool.query(
      'INSERT INTO member_profiles (user_id, membership_tier_id, fitness_goals, emergency_contact) VALUES ($1, $2, $3, $4) RETURNING *',
      [profileData.userId, profileData.membershipTierId, profileData.fitnessGoals, profileData.emergencyContact]
    );
    return this.mapMemberProfileFromDb(rows[0]);
  },

  async getMemberProfile(userId: string): Promise<MemberProfile | null> {
    const { rows } = await pool.query('SELECT * FROM member_profiles WHERE user_id = $1', [userId]);
    if (rows.length === 0) return null;
    return this.mapMemberProfileFromDb(rows[0]);
  },

  async getAllMembers(): Promise<any[]> {
    const { rows } = await pool.query(`
      SELECT u.*, mp.*, mt.name as membership_tier, mt.price as membership_tier_price
      FROM users u 
      LEFT JOIN member_profiles mp ON u.id = mp.user_id 
      LEFT JOIN membership_tiers mt ON mp.membership_tier_id = mt.id 
      WHERE u.user_type = 'member'
      ORDER BY u.created_at DESC
    `);

    if (rows.length === 0) return [];

    return rows.map(row => {
      const user = this.mapUserFromDb(row);
      if (!user) return null;
      return {
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        membershipTier: row.membership_tier || 'N/A',
        membershipTierId: row.membership_tier_id,
        joinDate: row.created_at,
        emergencyContact: row.emergency_contact,
        fitnessGoals: row.fitness_goals
      };
    }).filter(member => member !== null);
  },

  async updateMemberById(userId: string, updates: any): Promise<void> {
    const userFields = [];
    const userValues = [];
    let paramIndex = 1;

    if (updates.firstName) {
      userFields.push(`first_name = $${paramIndex++}`);
      userValues.push(updates.firstName);
    }
    if (updates.lastName) {
      userFields.push(`last_name = $${paramIndex++}`);
      userValues.push(updates.lastName);
    }
    if (updates.email) {
      userFields.push(`email = $${paramIndex++}`);
      userValues.push(updates.email);
    }
    if (updates.phone) {
      userFields.push(`phone = $${paramIndex++}`);
      userValues.push(updates.phone);
    }

    if (userFields.length > 0) {
      userFields.push(`updated_at = CURRENT_TIMESTAMP`);
      userValues.push(userId);
      await pool.query(
        `UPDATE users SET ${userFields.join(', ')} WHERE id = $${paramIndex}`,
        userValues
      );
    }

    // Update member profile if needed
    if (updates.fitnessGoals || updates.emergencyContact || updates.membershipTierId) {
      const profileFields = [];
      const profileValues = [];
      let profileParamIndex = 1;

      if (updates.fitnessGoals) {
        profileFields.push(`fitness_goals = $${profileParamIndex++}`);
        profileValues.push(updates.fitnessGoals);
      }
      if (updates.emergencyContact) {
        profileFields.push(`emergency_contact = $${profileParamIndex++}`);
        profileValues.push(updates.emergencyContact);
      }
      if (updates.membershipTierId) {
        profileFields.push(`membership_tier_id = $${profileParamIndex++}`);
        profileValues.push(updates.membershipTierId);
      }

      if (profileFields.length > 0) {
        profileFields.push(`updated_at = CURRENT_TIMESTAMP`);
        profileValues.push(userId);
        await pool.query(
          `UPDATE member_profiles SET ${profileFields.join(', ')} WHERE user_id = $${profileParamIndex}`,
          profileValues
        );
      }
    }
  },

  // Trainer profile operations
  async createTrainerProfile(profileData: Omit<TrainerProfile, 'id'>): Promise<TrainerProfile> {
    const { rows } = await pool.query(
      'INSERT INTO trainer_profiles (user_id, specializations, hourly_rate, experience_years, certifications, bio, is_available) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [profileData.userId, profileData.specializations, profileData.hourlyRate, profileData.experienceYears, profileData.certifications, profileData.bio, profileData.isAvailable]
    );
    return this.mapTrainerProfileFromDb(rows[0]);
  },

  async getTrainerProfile(userId: string): Promise<TrainerProfile | null> {
    const { rows } = await pool.query('SELECT * FROM trainer_profiles WHERE user_id = $1', [userId]);
    if (rows.length === 0) return null;
    return this.mapTrainerProfileFromDb(rows[0]);
  },

  async getAllTrainers(): Promise<any[]> {
    const { rows } = await pool.query(`
      SELECT u.*, tp.* 
      FROM users u 
      LEFT JOIN trainer_profiles tp ON u.id = tp.user_id 
      WHERE u.user_type = 'trainer'
      ORDER BY u.created_at DESC
    `);

    if (rows.length === 0) return [];

    return rows.map(row => {
      const user = this.mapUserFromDb(row);
      if (!user) return null;
      return {
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        specializations: row.specializations || [],
        hourlyRate: row.hourly_rate || 75,
        experienceYears: row.experience_years || 2,
        certifications: row.certifications || '',
        bio: row.bio || '',
        isAvailable: row.is_available !== false
      };
    }).filter(trainer => trainer !== null);
  },

  async updateTrainerById(userId: string, updates: any): Promise<void> {
    const userFields = [];
    const userValues = [];
    let paramIndex = 1;

    if (updates.firstName) {
      userFields.push(`first_name = $${paramIndex++}`);
      userValues.push(updates.firstName);
    }
    if (updates.lastName) {
      userFields.push(`last_name = $${paramIndex++}`);
      userValues.push(updates.lastName);
    }
    if (updates.email) {
      userFields.push(`email = $${paramIndex++}`);
      userValues.push(updates.email);
    }

    if (userFields.length > 0) {
      userFields.push(`updated_at = CURRENT_TIMESTAMP`);
      userValues.push(userId);
      await pool.query(
        `UPDATE users SET ${userFields.join(', ')} WHERE id = $${paramIndex}`,
        userValues
      );
    }

    // Update trainer profile if needed
    if (updates.specializations || updates.hourlyRate || updates.experienceYears || updates.certifications || updates.bio !== undefined || updates.isAvailable !== undefined) {
      const profileFields = [];
      const profileValues = [];
      let profileParamIndex = 1;

      if (updates.specializations) {
        profileFields.push(`specializations = $${profileParamIndex++}`);
        profileValues.push(updates.specializations);
      }
      if (updates.hourlyRate) {
        profileFields.push(`hourly_rate = $${profileParamIndex++}`);
        profileValues.push(updates.hourlyRate);
      }
      if (updates.experienceYears) {
        profileFields.push(`experience_years = $${profileParamIndex++}`);
        profileValues.push(updates.experienceYears);
      }
      if (updates.certifications) {
        profileFields.push(`certifications = $${profileParamIndex++}`);
        profileValues.push(updates.certifications);
      }
      if (updates.bio !== undefined) {
        profileFields.push(`bio = $${profileParamIndex++}`);
        profileValues.push(updates.bio);
      }
      if (updates.isAvailable !== undefined) {
        profileFields.push(`is_available = $${profileParamIndex++}`);
        profileValues.push(updates.isAvailable);
      }

      if (profileFields.length > 0) {
        profileFields.push(`updated_at = CURRENT_TIMESTAMP`);
        profileValues.push(userId);
        await pool.query(
          `UPDATE trainer_profiles SET ${profileFields.join(', ')} WHERE user_id = $${profileParamIndex}`,
          profileValues
        );
      }
    }
  },

  // Training sessions
  async createTrainingSession(sessionData: any): Promise<any> {
    const { rows } = await pool.query(
      'INSERT INTO training_sessions (member_id, trainer_id, session_type, scheduled_date, scheduled_time, duration, status, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [sessionData.memberId, sessionData.trainerId, sessionData.sessionType, sessionData.scheduledDate, sessionData.scheduledTime, sessionData.duration, sessionData.status || 'scheduled', sessionData.notes]
    );
    return rows[0];
  },

  async getTrainingSessions(filters: any): Promise<any[]> {
    let query = 'SELECT * FROM training_sessions WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (filters.memberId) {
      query += ` AND member_id = $${paramIndex++}`;
      params.push(filters.memberId);
    }
    if (filters.trainerId) {
      query += ` AND trainer_id = $${paramIndex++}`;
      params.push(filters.trainerId);
    }

    query += ' ORDER BY scheduled_date DESC, scheduled_time DESC';
    const { rows } = await pool.query(query, params);
    return rows;
  },

  // Workout plans
  async createWorkoutPlan(planData: any): Promise<any> {
    const { rows } = await pool.query(
      'INSERT INTO workout_plans (member_id, trainer_id, plan_name, description, duration, exercises) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [planData.memberId, planData.trainerId, planData.planName, planData.description, planData.duration, planData.exercises]
    );
    return rows[0];
  },

  async getWorkoutPlans(filters: any): Promise<any[]> {
    let query = 'SELECT * FROM workout_plans WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (filters.memberId) {
      query += ` AND member_id = $${paramIndex++}`;
      params.push(filters.memberId);
    }
    if (filters.trainerId) {
      query += ` AND trainer_id = $${paramIndex++}`;
      params.push(filters.trainerId);
    }

    query += ' ORDER BY created_at DESC';
    const { rows } = await pool.query(query, params);
    return rows;
  },

  // Nutrition plans
  async createNutritionPlan(planData: any): Promise<any> {
    const { rows } = await pool.query(
      'INSERT INTO nutrition_plans (member_id, trainer_id, plan_name, description, calories, meals) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [planData.memberId, planData.trainerId, planData.planName, planData.description, planData.calories, planData.meals]
    );
    return rows[0];
  },

  async getNutritionPlans(filters: any): Promise<any[]> {
    let query = 'SELECT * FROM nutrition_plans WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (filters.memberId) {
      query += ` AND member_id = $${paramIndex++}`;
      params.push(filters.memberId);
    }
    if (filters.trainerId) {
      query += ` AND trainer_id = $${paramIndex++}`;
      params.push(filters.trainerId);
    }

    query += ' ORDER BY created_at DESC';
    const { rows } = await pool.query(query, params);
    return rows;
  },

  // Body assessments
  async createBodyAssessment(assessmentData: any): Promise<any> {
    // Get member info to set client name
    const memberQuery = await pool.query(
      'SELECT u.first_name, u.last_name FROM users u WHERE u.id = $1',
      [assessmentData.memberId]
    );
    
    const clientName = memberQuery.rows[0] 
      ? `${memberQuery.rows[0].first_name} ${memberQuery.rows[0].last_name}`
      : 'Unknown Client';

    const { rows } = await pool.query(
      `INSERT INTO body_assessments (
        member_id, trainer_id, client_name, date_of_birth, age, height, bp, bp_after_treadmill,
        emergency_contact, bmi, weight, muscle, fat, saturated_fat, visceral_fat, bmr, body_age,
        postural_assessment, head_neck_alignment, shoulder_alignment, upper_back_alignment,
        lower_back_alignment, pelvic_alignment, hip_knee_alignment, ankle_alignment, spinal_mobility,
        recommendations, circumference_measurements, advice
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29) RETURNING *`,
      [
        assessmentData.memberId, assessmentData.trainerId || null, clientName,
        assessmentData.dateOfBirth, assessmentData.age, assessmentData.height, 
        assessmentData.bloodPressure, assessmentData.afterTreadmillBP, assessmentData.emergencyContact,
        assessmentData.bodyComposition?.bmi, assessmentData.bodyComposition?.weight, 
        assessmentData.bodyComposition?.muscle, assessmentData.bodyComposition?.fat, 
        assessmentData.bodyComposition?.saturatedFat, assessmentData.bodyComposition?.visceralFat, 
        assessmentData.bodyComposition?.bmr, assessmentData.bodyComposition?.bodyAge,
        JSON.stringify(assessmentData.posturalAssessment), assessmentData.posturalAssessment?.headNeckAlignment,
        assessmentData.posturalAssessment?.shoulderAlignment, assessmentData.posturalAssessment?.upperBackAlignment,
        assessmentData.posturalAssessment?.lowerBackAlignment, assessmentData.posturalAssessment?.pelvicAlignment,
        assessmentData.posturalAssessment?.hipKneeAlignment, assessmentData.posturalAssessment?.ankleAlignment, 
        assessmentData.posturalAssessment?.spinalMobility, JSON.stringify(assessmentData.posturalAssessment?.recommendations),
        JSON.stringify(assessmentData.circumferenceMeasurements), assessmentData.advice
      ]
    );
    return rows[0];
  },

  async getBodyAssessments(filters: any): Promise<any[]> {
    let query = `
      SELECT ba.*, ba.client_name as memberName,
             JSON_BUILD_OBJECT(
               'bmi', ba.bmi,
               'weight', ba.weight,
               'muscle', ba.muscle,
               'fat', ba.fat,
               'saturatedFat', ba.saturated_fat,
               'visceralFat', ba.visceral_fat,
               'bmr', ba.bmr,
               'bodyAge', ba.body_age
             ) as bodyComposition,
             ba.postural_assessment as posturalAssessment,
             ba.circumference_measurements as circumferenceMeasurements
      FROM body_assessments ba WHERE 1=1`;
    const params = [];
    let paramIndex = 1;

    if (filters.memberId) {
      query += ` AND ba.member_id = $${paramIndex++}`;
      params.push(filters.memberId);
    }
    if (filters.trainerId) {
      query += ` AND ba.trainer_id = $${paramIndex++}`;
      params.push(filters.trainerId);
    }

    query += ' ORDER BY ba.created_at DESC';
    const { rows } = await pool.query(query, params);
    return rows.map(row => ({
      ...row,
      _id: row.id,
      memberName: row.client_name,
      bodyComposition: row.bodycomposition,
      createdAt: row.created_at
    }));
  },

  // Subscriptions
  async createSubscription(subscriptionData: any): Promise<any> {
    const { rows } = await pool.query(
      'INSERT INTO subscriptions (member_id, membership_tier_id, start_date, end_date, is_active, auto_renew) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [subscriptionData.memberId, subscriptionData.membershipTierId, subscriptionData.startDate, subscriptionData.endDate, subscriptionData.isActive, subscriptionData.autoRenew]
    );
    return rows[0];
  },

  // Admin stats
  async getAdminStats(): Promise<any> {
    try {
      const memberCountQuery = await pool.query("SELECT COUNT(*) FROM users WHERE user_type = 'member'");
      const trainerCountQuery = await pool.query("SELECT COUNT(*) FROM users WHERE user_type = 'trainer'");
      const activeSubscriptionsQuery = await pool.query("SELECT COUNT(*) FROM subscriptions WHERE is_active = true");

      // Calculate monthly revenue from active subscriptions
      const revenueQuery = await pool.query(`
        SELECT COALESCE(SUM(mt.price), 0) as monthly_revenue 
        FROM subscriptions s 
        JOIN membership_tiers mt ON s.membership_tier_id = mt.id 
        WHERE s.is_active = true
      `);

      return {
        totalMembers: parseInt(memberCountQuery.rows[0]?.count || '0'),
        totalTrainers: parseInt(trainerCountQuery.rows[0]?.count || '0'),
        activeSubscriptions: parseInt(activeSubscriptionsQuery.rows[0]?.count || '0'),
        monthlyRevenue: parseFloat(revenueQuery.rows[0]?.monthly_revenue || '0'),
        totalSessions: 0 // Could be calculated from training_sessions table
      };
    } catch (error) {
      console.error('Error getting admin stats:', error);
      return {
        totalMembers: 0,
        totalTrainers: 0,
        activeSubscriptions: 0,
        monthlyRevenue: 0,
        totalSessions: 0
      };
    }
  },

  // Contact submissions
  async getContactSubmissions(): Promise<any[]> {
    try {
      const { rows } = await pool.query(`
        SELECT u.*, 'contact' as inquiry_type 
        FROM users u 
        WHERE u.email LIKE 'contact_%'
        ORDER BY u.created_at DESC
      `);
      
      return rows.map(row => ({
        _id: row.id,
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email.replace(/^contact_\d+_/, ''),
        phone: row.phone,
        location: 'Unknown',
        interest: 'General Fitness',
        message: 'Contact form submission',
        submittedAt: row.created_at
      }));
    } catch (error) {
      console.error('Error getting contact submissions:', error);
      return [];
    }
  },

  // Helper methods for mapping database results
  mapUserFromDb(row: any): User {
    if (!row || !row.id) return null;
    return {
      id: row.id.toString(),
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
      userType: row.user_type,
      phone: row.phone,
      stripeSubscriptionId: row.stripe_subscription_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  },

  mapMembershipTierFromDb(row: any): MembershipTier {
    if (!row || !row.id) return null;
    return {
      id: row.id.toString(),
      name: row.name,
      price: parseFloat(row.price),
      features: row.features,
      description: row.description
    };
  },

  mapMemberProfileFromDb(row: any): MemberProfile {
    if (!row || !row.id) return null;
    return {
      id: row.id.toString(),
      userId: row.user_id?.toString(),
      membershipTierId: row.membership_tier_id?.toString(),
      fitnessGoals: row.fitness_goals,
      emergencyContact: row.emergency_contact,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  },

  mapTrainerProfileFromDb(row: any): TrainerProfile {
    if (!row || !row.id) return null;
    return {
      id: row.id.toString(),
      userId: row.user_id?.toString(),
      specializations: row.specializations || [],
      hourlyRate: parseFloat(row.hourly_rate || 75),
      experienceYears: row.experience_years || 2,
      certifications: row.certifications || '',
      bio: row.bio || '',
      isAvailable: row.is_available !== false,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
};