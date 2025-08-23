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
  // New fields for session packages
  sessions?: number;
  duration?: string;
  oneOnOnePrice?: number;
  twoPeoplePrice?: number;
  threePeoplePrice?: number;
}

interface MemberProfile {
  id: string;
  userId: string;
  membershipTierId: string;
  fitnessGoals: string;
  emergencyContact: string;
  tierCategory?: string; // Added tierCategory
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
  // Get user by ID
  async getUser(userId: string): Promise<User | null> {
    try {
      const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
      if (rows.length === 0) return null;

      const row = rows[0];
      return {
        id: row.id.toString(),
        email: row.email,
        firstName: row.first_name,
        lastName: row.last_name,
        userType: row.user_type,
        phone: row.phone,
        stripeSubscriptionId: row.stripe_subscription_id,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        first_name: row.first_name,
        last_name: row.last_name,
        user_type: row.user_type
      };
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  // Get user by email
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (rows.length === 0) return null;

      const row = rows[0];
      return {
        id: row.id.toString(),
        email: row.email,
        firstName: row.first_name,
        lastName: row.last_name,
        userType: row.user_type,
        phone: row.phone,
        stripeSubscriptionId: row.stripe_subscription_id,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        first_name: row.first_name,
        last_name: row.last_name,
        user_type: row.user_type
      };
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  },

  // User operations
  async createUser(userData: Omit<User, 'id'>): Promise<User> {
    const { rows } = await pool.query(
      'INSERT INTO users (email, first_name, last_name, user_type, phone, stripe_subscription_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [userData.email, userData.firstName, userData.lastName, userData.userType, userData.phone || null, userData.stripeSubscriptionId || null]
    );
    return this.mapUserFromDb(rows[0]);
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
  async createMemberProfile(profileData: any): Promise<any> {
    try {
      // Get tier information to determine category
      let tierCategory = null;
      if (profileData.membershipTierId) {
        const tierResult = await pool.query('SELECT name FROM membership_tiers WHERE id = $1', [profileData.membershipTierId]);
        if (tierResult.rows.length > 0) {
          const tierName = tierResult.rows[0].name;
          if (tierName.includes('GOLD')) {
            tierCategory = 'Gold';
          } else if (tierName.includes('SILVER')) {
            tierCategory = 'Silver';
          } else if (tierName.includes('BRONZE')) {
            tierCategory = 'Bronze';
          }
        }
      }

      const { rows } = await pool.query(`
        INSERT INTO member_profiles (first_name, last_name, email, phone, membership_tier_id, emergency_contact, fitness_goals, tier_category)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `, [
        profileData.firstName,
        profileData.lastName,
        profileData.email,
        profileData.phone,
        profileData.membershipTierId,
        profileData.emergencyContact,
        profileData.fitnessGoals,
        tierCategory
      ]);
      return rows[0];
    } catch (error) {
      console.error("Error creating member profile:", error);
      throw error;
    }
  },

  async getMemberProfile(userId: string): Promise<MemberProfile | null> {
    const { rows } = await pool.query('SELECT * FROM member_profiles WHERE user_id = $1', [userId]);
    if (rows.length === 0) return null;
    return this.mapMemberProfileFromDb(rows[0]);
  },

  async getAllMembers(): Promise<any[]> {
    // Get only member profiles (exclude demo users completely)
    const { rows } = await pool.query(`
      SELECT mp.*, mt.name as membership_tier, mt.price as membership_tier_price
      FROM member_profiles mp
      LEFT JOIN membership_tiers mt ON mp.membership_tier_id = mt.id
      WHERE mp.user_id IS NULL
      ORDER BY mp.created_at DESC
    `);

    if (rows.length === 0) return [];

    return rows.map(row => ({
      userId: row.id.toString(),
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      phone: row.phone,
      membershipTier: row.membership_tier || 'N/A',
      membershipTierId: row.membership_tier_id,
      joinDate: row.created_at,
      emergencyContact: row.emergency_contact,
      fitnessGoals: row.fitness_goals
    }));
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

      // Update tier_category if membershipTierId is changed
      if (updates.membershipTierId) {
        const tierResult = await pool.query('SELECT name FROM membership_tiers WHERE id = $1', [updates.membershipTierId]);
        let tierCategory = null;
        if (tierResult.rows.length > 0) {
          const tierName = tierResult.rows[0].name;
          if (tierName.includes('GOLD')) {
            tierCategory = 'Gold';
          } else if (tierName.includes('SILVER')) {
            tierCategory = 'Silver';
          } else if (tierName.includes('BRONZE')) {
            tierCategory = 'Bronze';
          }
        }
        profileFields.push(`tier_category = $${profileParamIndex++}`);
        profileValues.push(tierCategory);
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
  async createTrainerProfile(profileData: any): Promise<any> {
    try {
      const { rows } = await pool.query(`
        INSERT INTO trainer_profiles (first_name, last_name, email, phone, specializations, hourly_rate, experience_years, certifications, bio, is_available)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `, [
        profileData.firstName,
        profileData.lastName,
        profileData.email,
        profileData.phone || null,
        profileData.specializations || [],
        profileData.hourlyRate || 75.00,
        profileData.experienceYears || 2,
        profileData.certifications || '',
        profileData.bio || '',
        profileData.isAvailable !== false
      ]);
      return rows[0];
    } catch (error) {
      console.error("Error creating trainer profile:", error);
      throw error;
    }
  },

  async getTrainerProfile(userId: string): Promise<TrainerProfile | null> {
    const { rows } = await pool.query('SELECT * FROM trainer_profiles WHERE user_id = $1', [userId]);
    if (rows.length === 0) return null;
    return this.mapTrainerProfileFromDb(rows[0]);
  },

  async getAllTrainers(): Promise<any[]> {
    // Get all trainer profiles
    const { rows } = await pool.query(`
      SELECT tp.*
      FROM trainer_profiles tp
      ORDER BY tp.created_at DESC
    `);

    if (rows.length === 0) return [];

    return rows.map(row => ({
      userId: row.id.toString(),
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      phone: row.phone,
      specializations: row.specializations || [],
      hourlyRate: row.hourly_rate || 75,
      experienceYears: row.experience_years || 2,
      certifications: row.certifications || '',
      bio: row.bio || '',
      isAvailable: row.is_available !== false,
      createdAt: row.created_at
    }));
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
  async createBodyAssessment(assessmentData: any) {
    try {
      const {
        memberId, dateOfBirth, age, height, bloodPressure, afterTreadmillBP,
        emergencyContact, bodyComposition, posturalAssessment,
        circumferenceMeasurements, advice
      } = assessmentData;

      // Get member name for the assessment
      let clientName = 'Unknown Client';
      if (memberId) {
        const { rows: memberRows } = await pool.query('SELECT first_name, last_name FROM member_profiles WHERE id = $1', [memberId]);
        if (memberRows.length > 0) {
          clientName = `${memberRows[0].first_name} ${memberRows[0].last_name}`;
        }
      }

      // Helper function to convert empty strings to null
      const toNullIfEmpty = (value: any): any => {
        if (value === '' || value === undefined) return null;
        return value;
      };

      // Helper function to convert empty strings to null for numbers
      const toNumberOrNull = (value: any): number | null => {
        if (value === '' || value === undefined || value === null) return null;
        const parsed = typeof value === 'string' ? parseFloat(value) : value;
        return isNaN(parsed) ? null : parsed;
      };

      const { rows } = await pool.query(`
        INSERT INTO body_assessments (
          member_id, client_name, date_of_birth, age, height, bp, bp_after_treadmill,
          emergency_contact, bmi, weight, muscle, fat, saturated_fat, visceral_fat,
          bmr, body_age, head_neck_alignment, shoulder_alignment,
          upper_back_alignment, lower_back_alignment, pelvic_alignment,
          hip_knee_alignment, ankle_alignment, spinal_mobility,
          recommendations, circumference_measurements, advice
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
          $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27
        ) RETURNING *
      `, [
        memberId, clientName, toNullIfEmpty(dateOfBirth), toNumberOrNull(age), toNumberOrNull(height),
        toNullIfEmpty(bloodPressure), toNullIfEmpty(afterTreadmillBP), toNullIfEmpty(emergencyContact),
        toNumberOrNull(bodyComposition?.bmi), toNumberOrNull(bodyComposition?.weight),
        toNumberOrNull(bodyComposition?.muscle), toNumberOrNull(bodyComposition?.fat),
        toNumberOrNull(bodyComposition?.saturatedFat), toNumberOrNull(bodyComposition?.visceralFat),
        toNumberOrNull(bodyComposition?.bmr), toNumberOrNull(bodyComposition?.bodyAge),
        toNullIfEmpty(posturalAssessment?.headNeckAlignment), toNullIfEmpty(posturalAssessment?.shoulderAlignment),
        toNullIfEmpty(posturalAssessment?.upperBackAlignment), toNullIfEmpty(posturalAssessment?.lowerBackAlignment),
        toNullIfEmpty(posturalAssessment?.pelvicAlignment), toNullIfEmpty(posturalAssessment?.hipKneeAlignment),
        toNullIfEmpty(posturalAssessment?.ankleAlignment), toNullIfEmpty(posturalAssessment?.spinalMobility),
        toNullIfEmpty(posturalAssessment?.recommendations?.stretching),
        JSON.stringify(circumferenceMeasurements || {}), toNullIfEmpty(advice)
      ]);

      return rows[0];
    } catch (error) {
      console.error("Error creating body assessment:", error);
      throw error;
    }
  },

  async updateBodyAssessment(assessmentId: string, updates: any) {
    try {
      const {
        memberId, dateOfBirth, age, height, bloodPressure, afterTreadmillBP,
        emergencyContact, bodyComposition, posturalAssessment,
        circumferenceMeasurements, advice
      } = updates;

      // Get member name if memberId is provided
      let clientName;
      if (memberId) {
        const { rows: memberRows } = await pool.query('SELECT first_name, last_name FROM member_profiles WHERE id = $1', [memberId]);
        if (memberRows.length > 0) {
          clientName = `${memberRows[0].first_name} ${memberRows[0].last_name}`;
        }
      }

      const fields = [];
      const values = [];
      let paramIndex = 1;

      if (memberId !== undefined) {
        fields.push(`member_id = $${paramIndex++}`);
        values.push(memberId);
      }
      if (clientName !== undefined) {
        fields.push(`client_name = $${paramIndex++}`);
        values.push(clientName);
      }
      if (dateOfBirth !== undefined) {
        fields.push(`date_of_birth = $${paramIndex++}`);
        values.push(dateOfBirth);
      }
      if (age !== undefined) {
        fields.push(`age = $${paramIndex++}`);
        values.push(age);
      }
      if (height !== undefined) {
        fields.push(`height = $${paramIndex++}`);
        values.push(height);
      }
      if (bloodPressure !== undefined) {
        fields.push(`bp = $${paramIndex++}`);
        values.push(bloodPressure);
      }
      if (afterTreadmillBP !== undefined) {
        fields.push(`bp_after_treadmill = $${paramIndex++}`);
        values.push(afterTreadmillBP);
      }
      if (emergencyContact !== undefined) {
        fields.push(`emergency_contact = $${paramIndex++}`);
        values.push(emergencyContact);
      }
      if (bodyComposition?.bmi !== undefined) {
        fields.push(`bmi = $${paramIndex++}`);
        values.push(bodyComposition.bmi);
      }
      if (bodyComposition?.weight !== undefined) {
        fields.push(`weight = $${paramIndex++}`);
        values.push(bodyComposition.weight);
      }
      if (bodyComposition?.muscle !== undefined) {
        fields.push(`muscle = $${paramIndex++}`);
        values.push(bodyComposition.muscle);
      }
      if (bodyComposition?.fat !== undefined) {
        fields.push(`fat = $${paramIndex++}`);
        values.push(bodyComposition.fat);
      }
      if (bodyComposition?.saturatedFat !== undefined) {
        fields.push(`saturated_fat = $${paramIndex++}`);
        values.push(bodyComposition.saturatedFat);
      }
      if (bodyComposition?.visceralFat !== undefined) {
        fields.push(`visceral_fat = $${paramIndex++}`);
        values.push(bodyComposition.visceralFat);
      }
      if (bodyComposition?.bmr !== undefined) {
        fields.push(`bmr = $${paramIndex++}`);
        values.push(bodyComposition.bmr);
      }
      if (bodyComposition?.bodyAge !== undefined) {
        fields.push(`body_age = $${paramIndex++}`);
        values.push(bodyComposition.bodyAge);
      }
      if (posturalAssessment?.headNeckAlignment !== undefined) {
        fields.push(`head_neck_alignment = $${paramIndex++}`);
        values.push(posturalAssessment.headNeckAlignment);
      }
      if (posturalAssessment?.shoulderAlignment !== undefined) {
        fields.push(`shoulder_alignment = $${paramIndex++}`);
        values.push(posturalAssessment.shoulderAlignment);
      }
      if (posturalAssessment?.upperBackAlignment !== undefined) {
        fields.push(`upper_back_alignment = $${paramIndex++}`);
        values.push(posturalAssessment.upperBackAlignment);
      }
      if (posturalAssessment?.lowerBackAlignment !== undefined) {
        fields.push(`lower_back_alignment = $${paramIndex++}`);
        values.push(posturalAssessment.lowerBackAlignment);
      }
      if (posturalAssessment?.pelvicAlignment !== undefined) {
        fields.push(`pelvic_alignment = $${paramIndex++}`);
        values.push(posturalAssessment.pelvicAlignment);
      }
      if (posturalAssessment?.hipKneeAlignment !== undefined) {
        fields.push(`hip_knee_alignment = $${paramIndex++}`);
        values.push(posturalAssessment.hipKneeAlignment);
      }
      if (posturalAssessment?.ankleAlignment !== undefined) {
        fields.push(`ankle_alignment = $${paramIndex++}`);
        values.push(posturalAssessment.ankleAlignment);
      }
      if (posturalAssessment?.spinalMobility !== undefined) {
        fields.push(`spinal_mobility = $${paramIndex++}`);
        values.push(posturalAssessment.spinalMobility);
      }
      if (posturalAssessment?.recommendations?.stretching !== undefined) {
        fields.push(`recommendations = $${paramIndex++}`);
        values.push(posturalAssessment.recommendations.stretching);
      }
      if (circumferenceMeasurements !== undefined) {
        fields.push(`circumference_measurements = $${paramIndex++}`);
        values.push(JSON.stringify(circumferenceMeasurements));
      }
      if (advice !== undefined) {
        fields.push(`advice = $${paramIndex++}`);
        values.push(advice);
      }

      if (fields.length > 0) {
        values.push(assessmentId);

        const { rows } = await pool.query(
          `UPDATE body_assessments SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
          values
        );

        return rows[0];
      }

      return null;
    } catch (error) {
      console.error("Error updating body assessment:", error);
      throw error;
    }
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

  // Inquiry management methods
  async createInquiry(inquiryData: any): Promise<any> {
    const { rows } = await pool.query(
      'INSERT INTO inquiries (first_name, last_name, email, phone, location, interest, message) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [inquiryData.firstName, inquiryData.lastName, inquiryData.email, inquiryData.phone, inquiryData.location, inquiryData.interest, inquiryData.message]
    );
    return rows[0];
  },

  async getContactSubmissions(): Promise<any[]> {
    try {
      const { rows } = await pool.query(`
        SELECT * FROM inquiries
        WHERE status != 'converted' AND status != 'cancelled'
        ORDER BY created_at DESC
      `);

      return rows.map(row => ({
        _id: row.id,
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
        phone: row.phone,
        location: row.location || 'Unknown',
        interest: row.interest || 'General Fitness',
        message: row.message || 'Contact form submission',
        submittedAt: row.created_at
      }));
    } catch (error) {
      console.error('Error getting contact submissions:', error);
      return [];
    }
  },

  // Trainer attendance methods
  async recordTrainerAttendance(data: any): Promise<any> {
    const { rows } = await pool.query(`
      INSERT INTO trainer_attendance (trainer_id, date, status, check_in_time, check_out_time, notes)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (trainer_id, date)
      DO UPDATE SET
        status = EXCLUDED.status,
        check_in_time = EXCLUDED.check_in_time,
        check_out_time = EXCLUDED.check_out_time,
        notes = EXCLUDED.notes,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [data.trainerId, data.date, data.status, data.checkInTime, data.checkOutTime, data.notes]);

    return rows[0];
  },

  async getTrainerAttendance(date: string): Promise<any[]> {
    const { rows } = await pool.query(`
      SELECT ta.*, tp.first_name, tp.last_name, tp.email,
             CONCAT(tp.first_name, ' ', tp.last_name) as trainer_name
      FROM trainer_attendance ta
      JOIN trainer_profiles tp ON ta.trainer_id = tp.id
      WHERE ta.date = $1
      ORDER BY ta.check_in_time DESC NULLS LAST
    `, [date]);
    return rows.map(row => ({
      ...row,
      _id: row.id,
      trainerId: row.trainer_id,
      trainerName: row.trainer_name,
      checkInTime: row.check_in_time,
      checkOutTime: row.check_out_time
    }));
  },

  // Member session attendance methods
  async recordMemberSessionAttendance(data: any) {
    const { rows } = await pool.query(`
      INSERT INTO member_session_attendance (
        member_id, trainer_id, session_date, session_time, session_type,
        status, notes, member_name, trainer_name, duration_minutes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      data.memberId, data.trainerId, data.sessionDate, data.sessionTime,
      data.sessionType, data.status || 'attended', data.notes,
      data.memberName, data.trainerName, data.durationMinutes || 60
    ]);

    return rows[0];
  },

  async getMemberSessionAttendance(filters: any = {}) {
    let query = `
      SELECT msa.*,
             COALESCE(msa.member_name, CONCAT(mp.first_name, ' ', mp.last_name)) as member_name,
             COALESCE(msa.trainer_name, CONCAT(tp.first_name, ' ', tp.last_name)) as trainer_name
      FROM member_session_attendance msa
      LEFT JOIN member_profiles mp ON msa.member_id = mp.id
      LEFT JOIN trainer_profiles tp ON msa.trainer_id = tp.id
      WHERE 1=1
    `;
    const values: any[] = [];
    let paramIndex = 1;

    if (filters.memberId) {
      query += ` AND msa.member_id = $${paramIndex++}`;
      values.push(filters.memberId);
    }
    if (filters.trainerId) {
      query += ` AND msa.trainer_id = $${paramIndex++}`;
      values.push(filters.trainerId);
    }
    if (filters.sessionDate) {
      query += ` AND msa.session_date = $${paramIndex++}`;
      values.push(filters.sessionDate);
    }
    if (filters.dateRange) {
      query += ` AND msa.session_date BETWEEN $${paramIndex++} AND $${paramIndex++}`;
      values.push(filters.dateRange.start, filters.dateRange.end);
    }

    query += ' ORDER BY msa.session_date DESC, msa.session_time DESC';

    const { rows } = await pool.query(query, values);
    return rows;
  },

  async updateMemberSessionAttendance(attendanceId: string, updates: any) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (updates.sessionDate) {
      fields.push(`session_date = $${paramIndex++}`);
      values.push(updates.sessionDate);
    }
    if (updates.sessionTime) {
      fields.push(`session_time = $${paramIndex++}`);
      values.push(updates.sessionTime);
    }
    if (updates.sessionType) {
      fields.push(`session_type = $${paramIndex++}`);
      values.push(updates.sessionType);
    }
    if (updates.status) {
      fields.push(`status = $${paramIndex++}`);
      values.push(updates.status);
    }
    if (updates.notes !== undefined) {
      fields.push(`notes = $${paramIndex++}`);
      values.push(updates.notes);
    }
    if (updates.durationMinutes) {
      fields.push(`duration_minutes = $${paramIndex++}`);
      values.push(updates.durationMinutes);
    }

    if (fields.length > 0) {
      fields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(attendanceId);

      await pool.query(
        `UPDATE member_session_attendance SET ${fields.join(', ')} WHERE id = $${paramIndex}`,
        values
      );
    }
  },

  async deleteMemberSessionAttendance(attendanceId: string) {
    const { rows } = await pool.query('DELETE FROM member_session_attendance WHERE id = $1 RETURNING *', [attendanceId]);
    return rows[0];
  },

  // Member trainer assignment methods
  async assignTrainerToMember(data: any) {
    const { rows } = await pool.query(`
      INSERT INTO member_trainer_assignments (member_id, trainer_id, assigned_date, notes)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (member_id, trainer_id)
      DO UPDATE SET
        is_active = true,
        assigned_date = EXCLUDED.assigned_date,
        notes = EXCLUDED.notes,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [data.memberId, data.trainerId, data.assignedDate || new Date().toISOString().split('T')[0], data.notes]);

    return rows[0];
  },

  async getMemberTrainerAssignments(filters: { memberId?: string, trainerId?: string } = {}) {
    try {
      let query = `
        SELECT mta.*, 
               mp.first_name as member_first_name,
               mp.last_name as member_last_name,
               CONCAT(mp.first_name, ' ', mp.last_name) as member_name,
               mp.email as member_email,
               mp.phone as member_phone,
               tp.first_name as trainer_first_name,
               tp.last_name as trainer_last_name,
               CONCAT(tp.first_name, ' ', tp.last_name) as trainer_name,
               tp.email as trainer_email
        FROM member_trainer_assignments mta
        LEFT JOIN member_profiles mp ON mta.member_id = mp.id
        LEFT JOIN trainer_profiles tp ON mta.trainer_id = tp.id
        WHERE mta.is_active = true
      `;

      const params = [];
      let paramIndex = 1;

      if (filters.memberId) {
        query += ` AND mta.member_id = $${paramIndex++}`;
        params.push(filters.memberId);
      }

      if (filters.trainerId) {
        query += ` AND mta.trainer_id = $${paramIndex++}`;
        params.push(filters.trainerId);
      }

      query += ` ORDER BY mta.assigned_date DESC`;

      const { rows } = await pool.query(query, params);
      return rows.map(row => ({
        id: row.id,
        member_id: row.member_id,
        trainer_id: row.trainer_id,
        member_name: row.member_name,
        member_first_name: row.member_first_name,
        member_last_name: row.member_last_name,
        member_email: row.member_email,
        member_phone: row.member_phone,
        trainer_name: row.trainer_name,
        trainer_first_name: row.trainer_first_name,
        trainer_last_name: row.trainer_last_name,
        trainer_email: row.trainer_email,
        assigned_date: row.assigned_date,
        notes: row.notes,
        is_active: row.is_active
      }));
    } catch (error) {
      console.error('Error getting member trainer assignments:', error);
      throw error;
    }
  },

  async removeTrainerFromMember(memberId: string, trainerId: string) {
    const { rows } = await pool.query(`
      UPDATE member_trainer_assignments 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE member_id = $1 AND trainer_id = $2
      RETURNING *
    `, [memberId, trainerId]);

    return rows[0];
  },

  // Member session scheduling methods
  async createMemberSession(sessionData: any): Promise<any> {
    // Validate and clean input data
    const memberId = sessionData.memberId || null;
    const trainerId = sessionData.trainerId || null;
    const sessionType = sessionData.sessionType && sessionData.sessionType.trim() !== '' ? sessionData.sessionType : 'General Training';
    const scheduledDate = sessionData.scheduledDate || null;
    const scheduledTime = sessionData.scheduledTime && sessionData.scheduledTime.trim() !== '' ? sessionData.scheduledTime : null;
    const duration = sessionData.duration || 60;
    const status = sessionData.status || 'scheduled';
    const notes = sessionData.notes && sessionData.notes.trim() !== '' ? sessionData.notes : null;
    const memberName = sessionData.memberName && sessionData.memberName.trim() !== '' ? sessionData.memberName : null;
    const trainerName = sessionData.trainerName && sessionData.trainerName.trim() !== '' ? sessionData.trainerName : null;

    const { rows } = await pool.query(
      `INSERT INTO member_sessions (member_id, trainer_id, session_type, scheduled_date, scheduled_time, duration, status, notes, member_name, trainer_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [memberId, trainerId, sessionType, scheduledDate, scheduledTime, duration, status, notes, memberName, trainerName]
    );
    return rows[0];
  },

  async getMemberSessions(filters: any): Promise<any[]> {
    let query = `
      SELECT ms.*, mp.first_name as member_first_name, mp.last_name as member_last_name,
             tp.first_name as trainer_first_name, tp.last_name as trainer_last_name
      FROM member_sessions ms
      LEFT JOIN member_profiles mp ON ms.member_id = mp.id
      LEFT JOIN trainer_profiles tp ON ms.trainer_id = tp.id
      WHERE 1=1`;
    const params = [];
    let paramIndex = 1;

    if (filters.memberId) {
      query += ` AND ms.member_id = $${paramIndex++}`;
      params.push(filters.memberId);
    }
    if (filters.trainerId) {
      query += ` AND ms.trainer_id = $${paramIndex++}`;
      params.push(filters.trainerId);
    }
    if (filters.date) {
      query += ` AND ms.scheduled_date = $${paramIndex++}`;
      params.push(filters.date);
    }

    query += ' ORDER BY ms.scheduled_date DESC, ms.scheduled_time DESC';
    const { rows } = await pool.query(query, params);
    return rows.map(row => ({
      ...row,
      memberName: `${row.member_first_name || ''} ${row.member_last_name || ''}`.trim() || row.member_name,
      trainerName: `${row.trainer_first_name || ''} ${row.trainer_last_name || ''}`.trim() || row.trainer_name
    }));
  },

  async updateMemberSession(sessionId: string, updates: any): Promise<void> {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (updates.status && updates.status.trim() !== '') {
      fields.push(`status = $${paramIndex++}`);
      values.push(updates.status);
    }
    if (updates.notes !== undefined) {
      fields.push(`notes = $${paramIndex++}`);
      values.push(updates.notes && updates.notes.trim() !== '' ? updates.notes : null);
    }
    if (updates.scheduledDate && updates.scheduledDate.trim() !== '') {
      fields.push(`scheduled_date = $${paramIndex++}`);
      values.push(updates.scheduledDate);
    }
    if (updates.scheduledTime !== undefined) {
      fields.push(`scheduled_time = $${paramIndex++}`);
      values.push(updates.scheduledTime && updates.scheduledTime.trim() !== '' ? updates.scheduledTime : null);
    }

    if (fields.length > 0) {
      fields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(sessionId);
      await pool.query(
        `UPDATE member_sessions SET ${fields.join(', ')} WHERE id = $${paramIndex}`,
        values
      );
    }
  },

  async deleteMemberSession(sessionId: string): Promise<void> {
    await pool.query('DELETE FROM member_sessions WHERE id = $1', [sessionId]);
  },

  // Initialize membership tiers
  async initializeMembershipTiers() {
    try {
      // Check if tiers already exist
      const { rows: existingTiers } = await pool.query('SELECT COUNT(*) as count FROM membership_tiers');
      if (existingTiers[0].count > 0) {
        console.log('Membership tiers already exist, skipping initialization');
        return;
      }

      const tiers = [
        // 12 Session Packages
        {
          name: 'ONE_ON_ONE_12_SESSIONS',
          price: 18000,
          sessions: 12,
          duration: '1 month',
          oneOnOnePrice: 1500,
          twoPeoplePrice: 1200,
          threePeoplePrice: 1000,
          features: ['One-on-one personal training', 'Customized workout plans', 'Progress tracking', 'Nutrition guidance'],
          description: '12 intensive personal training sessions designed for maximum results'
        },
        {
          name: 'TWO_PEOPLE_12_SESSIONS',
          price: 14400,
          sessions: 12,
          duration: '1 month',
          oneOnOnePrice: 1500,
          twoPeoplePrice: 1200,
          threePeoplePrice: 1000,
          features: ['Partner training sessions', 'Shared motivation', 'Cost-effective training', 'Customized routines'],
          description: '12 partner training sessions for motivated duos'
        },
        {
          name: 'THREE_PEOPLE_12_SESSIONS',
          price: 12000,
          sessions: 12,
          duration: '1 month',
          oneOnOnePrice: 1500,
          twoPeoplePrice: 1200,
          threePeoplePrice: 1000,
          features: ['Small group training', 'Team building exercises', 'Affordable group rates', 'Social fitness'],
          description: '12 small group training sessions for fitness enthusiasts'
        },

        // 24 Session Packages
        {
          name: 'ONE_ON_ONE_24_SESSIONS',
          price: 34200,
          sessions: 24,
          duration: '1 month',
          oneOnOnePrice: 1425,
          twoPeoplePrice: 1140,
          threePeoplePrice: 950,
          features: ['Extended personal training', 'Advanced technique development', 'Comprehensive fitness assessment', 'Detailed progress reports'],
          description: '24 comprehensive sessions for serious fitness transformation'
        },
        {
          name: 'TWO_PEOPLE_24_SESSIONS',
          price: 27360,
          sessions: 24,
          duration: '1 month',
          oneOnOnePrice: 1425,
          twoPeoplePrice: 1140,
          threePeoplePrice: 950,
          features: ['Extended partner training', 'Competition-style workouts', 'Buddy system motivation', 'Shared achievement goals'],
          description: '24 partner sessions for committed fitness pairs'
        },
        {
          name: 'THREE_PEOPLE_24_SESSIONS',
          price: 22800,
          sessions: 24,
          duration: '1 month',
          oneOnOnePrice: 1425,
          twoPeoplePrice: 1140,
          threePeoplePrice: 950,
          features: ['Extended group training', 'Team challenges', 'Group fitness goals', 'Social accountability'],
          description: '24 group sessions for dedicated fitness teams'
        },

        // 36 Session Packages
        {
          name: 'ONE_ON_ONE_36_SESSIONS',
          price: 48600,
          sessions: 36,
          duration: '3 months',
          oneOnOnePrice: 1350,
          twoPeoplePrice: 1080,
          threePeoplePrice: 900,
          features: ['Quarterly transformation program', 'Advanced training techniques', 'Lifestyle coaching', 'Complete body recomposition'],
          description: '36 sessions for complete fitness transformation over 3 months'
        },
        {
          name: 'TWO_PEOPLE_36_SESSIONS',
          price: 38880,
          sessions: 36,
          duration: '3 months',
          oneOnOnePrice: 1350,
          twoPeoplePrice: 1080,
          threePeoplePrice: 900,
          features: ['Quarterly partner program', 'Synchronized training routines', 'Mutual support system', 'Shared transformation journey'],
          description: '36 partner sessions for long-term fitness commitment'
        },
        {
          name: 'THREE_PEOPLE_36_SESSIONS',
          price: 32400,
          sessions: 36,
          duration: '3 months',
          oneOnOnePrice: 1350,
          twoPeoplePrice: 1080,
          threePeoplePrice: 900,
          features: ['Quarterly group program', 'Team fitness challenges', 'Group transformation goals', 'Community support'],
          description: '36 group sessions for sustained fitness progress'
        },

        // 72 Session Packages
        {
          name: 'ONE_ON_ONE_72_SESSIONS',
          price: 86400,
          sessions: 72,
          duration: '6 months',
          oneOnOnePrice: 1200,
          twoPeoplePrice: 960,
          threePeoplePrice: 800,
          features: ['Complete lifestyle transformation', 'Advanced coaching techniques', 'Holistic wellness approach', 'Long-term habit formation'],
          description: '72 sessions for ultimate fitness mastery over 6 months'
        },
        {
          name: 'TWO_PEOPLE_72_SESSIONS',
          price: 69120,
          sessions: 72,
          duration: '6 months',
          oneOnOnePrice: 1200,
          twoPeoplePrice: 960,
          threePeoplePrice: 800,
          features: ['Extended partner transformation', 'Long-term accountability', 'Comprehensive fitness journey', 'Sustained motivation'],
          description: '72 partner sessions for ultimate fitness partnership'
        },
        {
          name: 'THREE_PEOPLE_72_SESSIONS',
          price: 57600,
          sessions: 72,
          duration: '6 months',
          oneOnOnePrice: 1200,
          twoPeoplePrice: 960,
          threePeoplePrice: 800,
          features: ['Extended group transformation', 'Long-term team building', 'Comprehensive group fitness', 'Community achievement'],
          description: '72 group sessions for ultimate team fitness success'
        }
      ];

      for (const tier of tiers) {
        await pool.query(`
          INSERT INTO membership_tiers (name, price, sessions, duration, oneOnOnePrice, twoPeoplePrice, threePeoplePrice, features, description)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (name) DO NOTHING
        `, [
          tier.name, 
          tier.price, 
          tier.sessions, 
          tier.duration, 
          tier.oneOnOnePrice, 
          tier.twoPeoplePrice, 
          tier.threePeoplePrice, 
          tier.features, 
          tier.description
        ]);
      }
      console.log('Membership tiers initialized successfully.');
    } catch (error) {
      console.error('Error initializing membership tiers:', error);
      throw error;
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
      description: row.description,
      // Map new fields
      sessions: row.sessions,
      duration: row.duration,
      oneOnOnePrice: row.oneononeprice,
      twoPeoplePrice: row.twopeopleprice,
      threePeoplePrice: row.threepeopleprice
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
      tierCategory: row.tier_category, // Include tierCategory
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
  },

  // Delete trainer profile
  async deleteTrainerProfile(trainerId: string): Promise<void> {
    try {
      const { rows } = await pool.query('DELETE FROM trainer_profiles WHERE id = $1 RETURNING *', [trainerId]);
      if (rows.length === 0) {
        throw new Error(`Trainer with id ${trainerId} not found`);
      }
      console.log(`Successfully deleted trainer with id: ${trainerId}`);
    } catch (error) {
      console.error(`Error deleting trainer ${trainerId}:`, error);
      throw error;
    }
  }
};