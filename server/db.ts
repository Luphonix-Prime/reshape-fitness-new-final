import { Pool } from 'pg';

const connectionString = 'postgresql://neondb_owner:npg_JKfVe1Scpz7R@ep-proud-resonance-afmhcyuk-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

export const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

export async function initializeDatabase() {
  try {
    console.log('Connecting to PostgreSQL...');

    // Test connection
    const client = await pool.connect();
    console.log('Connected to PostgreSQL successfully');
    client.release();

    // Create tables if they don't exist
    await createTables();
    await insertSampleData();

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

async function createTables() {
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      first_name VARCHAR(255) NOT NULL,
      last_name VARCHAR(255) NOT NULL,
      user_type VARCHAR(50) NOT NULL DEFAULT 'member',
      phone VARCHAR(20),
      stripe_subscription_id VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createMembershipTiersTable = `
    CREATE TABLE IF NOT EXISTS membership_tiers (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      features TEXT[],
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createMemberProfilesTable = `
    CREATE TABLE IF NOT EXISTS member_profiles (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      first_name VARCHAR(255) NOT NULL,
      last_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      phone VARCHAR(20),
      membership_tier_id INTEGER REFERENCES membership_tiers(id),
      fitness_goals TEXT,
      emergency_contact VARCHAR(255),
      tier_category VARCHAR(20),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createTrainerProfilesTable = `
    CREATE TABLE IF NOT EXISTS trainer_profiles (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      first_name VARCHAR(255) NOT NULL,
      last_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      phone VARCHAR(20),
      specializations TEXT[],
      hourly_rate DECIMAL(10,2) DEFAULT 75.00,
      experience_years INTEGER DEFAULT 2,
      certifications TEXT,
      bio TEXT,
      is_available BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createSubscriptionsTable = `
    CREATE TABLE IF NOT EXISTS subscriptions (
      id SERIAL PRIMARY KEY,
      member_id INTEGER REFERENCES member_profiles(id) ON DELETE CASCADE,
      membership_tier_id INTEGER REFERENCES membership_tiers(id),
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      is_active BOOLEAN DEFAULT true,
      auto_renew BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createTrainingSessionsTable = `
    CREATE TABLE IF NOT EXISTS training_sessions (
      id SERIAL PRIMARY KEY,
      member_id INTEGER REFERENCES member_profiles(id),
      trainer_id INTEGER REFERENCES trainer_profiles(id),
      session_type VARCHAR(255),
      scheduled_date DATE,
      scheduled_time TIME,
      duration INTEGER DEFAULT 60,
      status VARCHAR(50) DEFAULT 'scheduled',
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createWorkoutPlansTable = `
    CREATE TABLE IF NOT EXISTS workout_plans (
      id SERIAL PRIMARY KEY,
      member_id INTEGER REFERENCES member_profiles(id),
      trainer_id INTEGER REFERENCES trainer_profiles(id),
      plan_name VARCHAR(255) NOT NULL,
      description TEXT,
      duration INTEGER,
      exercises TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createNutritionPlansTable = `
    CREATE TABLE IF NOT EXISTS nutrition_plans (
      id SERIAL PRIMARY KEY,
      member_id INTEGER REFERENCES member_profiles(id),
      trainer_id INTEGER REFERENCES trainer_profiles(id),
      plan_name VARCHAR(255) NOT NULL,
      description TEXT,
      calories INTEGER,
      meals TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createBodyAssessmentsTable = `
    CREATE TABLE IF NOT EXISTS body_assessments (
      id SERIAL PRIMARY KEY,
      member_id INTEGER REFERENCES member_profiles(id),
      trainer_id INTEGER REFERENCES trainer_profiles(id),
      client_name VARCHAR(255) NOT NULL,
      date_of_birth DATE,
      age INTEGER,
      height DECIMAL(5,2),
      bp VARCHAR(20),
      bp_after_treadmill VARCHAR(20),
      emergency_contact VARCHAR(255),
      bmi DECIMAL(5,2),
      weight DECIMAL(5,2),
      muscle DECIMAL(5,2),
      fat DECIMAL(5,2),
      saturated_fat DECIMAL(5,2),
      visceral_fat DECIMAL(5,2),
      bmr INTEGER,
      body_age INTEGER,
      postural_assessment TEXT,
      head_neck_alignment VARCHAR(255),
      shoulder_alignment VARCHAR(255),
      upper_back_alignment VARCHAR(255),
      lower_back_alignment VARCHAR(255),
      pelvic_alignment VARCHAR(255),
      hip_knee_alignment VARCHAR(255),
      ankle_alignment VARCHAR(255),
      spinal_mobility VARCHAR(255),
      recommendations TEXT,
      circumference_measurements JSONB,
      advice TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createAttendanceTable = `
    CREATE TABLE IF NOT EXISTS attendance (
      id SERIAL PRIMARY KEY,
      member_id INTEGER REFERENCES member_profiles(id),
      check_in_time TIMESTAMP NOT NULL,
      check_out_time TIMESTAMP,
      date DATE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createTrainerAttendanceTable = `
    CREATE TABLE IF NOT EXISTS trainer_attendance (
      id SERIAL PRIMARY KEY,
      trainer_id INTEGER REFERENCES trainer_profiles(id) ON DELETE CASCADE,
      date DATE NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'present',
      check_in_time TIME,
      check_out_time TIME,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(trainer_id, date)
    );
  `;

  const createMemberSessionsTable = `
    CREATE TABLE IF NOT EXISTS member_sessions (
      id SERIAL PRIMARY KEY,
      member_id INTEGER REFERENCES member_profiles(id) ON DELETE CASCADE,
      trainer_id INTEGER REFERENCES trainer_profiles(id) ON DELETE CASCADE,
      session_type VARCHAR(255) NOT NULL,
      scheduled_date DATE NOT NULL,
      scheduled_time TIME NOT NULL,
      duration INTEGER DEFAULT 60,
      status VARCHAR(50) DEFAULT 'scheduled',
      notes TEXT,
      member_name VARCHAR(255),
      trainer_name VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createInquiriesTable = `
    CREATE TABLE IF NOT EXISTS inquiries (
      id SERIAL PRIMARY KEY,
      first_name VARCHAR(255) NOT NULL,
      last_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(20),
      location VARCHAR(255),
      interest VARCHAR(255),
      message TEXT,
      status VARCHAR(50) DEFAULT 'new',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createMemberSessionAttendanceTable = `
    CREATE TABLE IF NOT EXISTS member_session_attendance (
      id SERIAL PRIMARY KEY,
      member_id INTEGER REFERENCES member_profiles(id) ON DELETE CASCADE,
      trainer_id INTEGER REFERENCES trainer_profiles(id) ON DELETE CASCADE,
      session_date DATE NOT NULL,
      session_time TIME,
      session_type VARCHAR(255),
      status VARCHAR(50) DEFAULT 'attended',
      notes TEXT,
      member_name VARCHAR(255),
      trainer_name VARCHAR(255),
      duration_minutes INTEGER DEFAULT 60,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createMemberTrainerAssignmentsTable = `
    CREATE TABLE IF NOT EXISTS member_trainer_assignments (
      id SERIAL PRIMARY KEY,
      member_id INTEGER REFERENCES member_profiles(id) ON DELETE CASCADE,
      trainer_id INTEGER REFERENCES trainer_profiles(id) ON DELETE CASCADE,
      assigned_date DATE DEFAULT CURRENT_DATE,
      is_active BOOLEAN DEFAULT true,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(member_id, trainer_id)
    );
  `;

  const tables = [
    createUsersTable,
    createMembershipTiersTable,
    createMemberProfilesTable,
    createTrainerProfilesTable,
    createSubscriptionsTable,
    createTrainingSessionsTable,
    createWorkoutPlansTable,
    createNutritionPlansTable,
    createBodyAssessmentsTable,
    createAttendanceTable,
    createTrainerAttendanceTable,
    createMemberSessionsTable,
    createInquiriesTable,
    createMemberSessionAttendanceTable,
    createMemberTrainerAssignmentsTable
  ];

  for (const table of tables) {
    await pool.query(table);
  }
}

async function insertSampleData() {
  try {
    // Insert membership tiers (always check/insert these)
    const { rows: existingTiers } = await pool.query('SELECT COUNT(*) FROM membership_tiers');
    if (parseInt(existingTiers[0].count) === 0) {
      const tiers = [
        {
          name: 'TIER 1',
          price: 18000,
          duration: '1 month',
          sessions: 12,
          oneOnOnePrice: 1500,
          twoPeoplePrice: 1200,
          threePeoplePrice: 1000,
          description: '12 sessions in 1 month',
          features: JSON.stringify([
            '12 Personal Training Sessions',
            'Body Composition Analysis',
            'Customized Workout Plans',
            'Nutrition Guidance',
            'Progress Tracking'
          ])
        },
        {
          name: 'TIER 2',
          price: 34200,
          duration: '1 month',
          sessions: 24,
          oneOnOnePrice: 1425,
          twoPeoplePrice: 1140,
          threePeoplePrice: 950,
          description: '24 sessions in 1 month',
          features: JSON.stringify([
            '24 Personal Training Sessions',
            'Advanced Body Analysis',
            'Personalized Meal Plans',
            'Weekly Progress Reviews',
            'Priority Booking',
            'Supplement Guidance'
          ])
        },
        {
          name: 'TIER 3',
          price: 48600,
          duration: '3 months',
          sessions: 36,
          oneOnOnePrice: 1350,
          twoPeoplePrice: 1080,
          threePeoplePrice: 900,
          description: '36 sessions in 3 months',
          features: JSON.stringify([
            '36 Personal Training Sessions',
            'Comprehensive Health Assessment',
            'Custom Nutrition & Meal Planning',
            'Bi-weekly Progress Evaluations',
            'VIP Access to Equipment',
            'Recovery & Mobility Sessions'
          ])
        },
        {
          name: 'TIER 4',
          price: 86400,
          duration: '6 months',
          sessions: 72,
          oneOnOnePrice: 1200,
          twoPeoplePrice: 960,
          threePeoplePrice: 800,
          description: '72 sessions in 6 months',
          features: JSON.stringify([
            '72 Personal Training Sessions',
            'Complete Transformation Program',
            'Advanced Nutritional Coaching',
            'Monthly Body Composition Analysis',
            'Lifestyle & Habit Coaching',
            'Exclusive Member Events',
            'Long-term Health Planning'
          ])
        }
      ];

      for (const tier of tiers) {
        await pool.query(
          'INSERT INTO membership_tiers (name, price, features, description) VALUES ($1, $2, $3, $4)',
          [tier.name, tier.price, tier.features, tier.description]
        );
      }
      console.log('Membership tiers inserted');
    }

    // Always ensure admin, trainer, and member users exist
    const adminEmail = 'admin@reshape.com';
    const trainerEmail = 'trainer@reshape.com';
    const memberEmail = 'member@reshape.com';

    // Check and insert admin user
    const { rows: existingAdmin } = await pool.query('SELECT id FROM users WHERE email = $1', [adminEmail]);
    if (existingAdmin.length === 0) {
      await pool.query(
        'INSERT INTO users (email, first_name, last_name, user_type) VALUES ($1, $2, $3, $4)',
        [adminEmail, 'Admin', 'User', 'admin']
      );
      console.log('Admin user created');
    }

    // Check and insert trainer user
    const { rows: existingTrainer } = await pool.query('SELECT id FROM users WHERE email = $1', [trainerEmail]);
    if (existingTrainer.length === 0) {
      const { rows: trainerRows } = await pool.query(
        'INSERT INTO users (email, first_name, last_name, user_type) VALUES ($1, $2, $3, $4) RETURNING id',
        [trainerEmail, 'Trainer', 'Pro', 'trainer']
      );

      // Create trainer profile
      if (trainerRows[0]) {
        await pool.query(
          'INSERT INTO trainer_profiles (user_id, specializations, hourly_rate, experience_years, certifications, bio, is_available) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [trainerRows[0].id, ['Strength Training', 'Cardio', 'Weight Loss'], 75.00, 3, 'NASM Certified Personal Trainer', 'Experienced fitness trainer specializing in strength training and weight loss.', true]
        );
      }
      console.log('Trainer user and profile created');
    }

    // Check and insert member user
    const { rows: existingMember } = await pool.query('SELECT id FROM users WHERE email = $1', [memberEmail]);
    if (existingMember.length === 0) {
      const { rows: memberRows } = await pool.query(
        'INSERT INTO users (email, first_name, last_name, user_type) VALUES ($1, $2, $3, $4) RETURNING id',
        [memberEmail, 'Member', 'Test', 'member']
      );

      // Create member profile with a membership tier and category
      if (memberRows[0]) {
        const { rows: tierRowsBronze } = await pool.query('SELECT id FROM membership_tiers WHERE name = $1 LIMIT 1', ['TIER 1']);
        if (tierRowsBronze[0]) {
          await pool.query(
            'INSERT INTO member_profiles (user_id, membership_tier_id, fitness_goals, emergency_contact, tier_category) VALUES ($1, $2, $3, $4, $5)',
            [memberRows[0].id, tierRowsBronze[0].id, 'General fitness and health improvement', memberEmail, 'Tier 1']
          );
        }
      }
      console.log('Member user and profile created');
    }

    // Insert sample body assessments
    const { rows: existingAssessments } = await pool.query('SELECT COUNT(*) FROM body_assessments');
    if (parseInt(existingAssessments[0].count) === 0) {
      const sampleAssessments = [
        {
          client_name: 'dhyey patel',
          date_of_birth: '2025-01-01',
          age: 25,
          height: 175.5,
          bp: '120/80',
          bp_after_treadmill: '140/85',
          emergency_contact: 'emergency@example.com',
          bmi: 22.5,
          weight: 70.5,
          muscle: 45.2,
          fat: 15.8,
          saturated_fat: 8.5,
          visceral_fat: 5.2,
          bmr: 1650,
          body_age: 23,
          advice: 'Maintain current fitness level with regular cardio exercises'
        },
        {
          client_name: 'John Smith',
          date_of_birth: '1990-05-15',
          age: 34,
          height: 180.0,
          bp: '125/82',
          bp_after_treadmill: '145/88',
          emergency_contact: 'john.emergency@example.com',
          bmi: 24.7,
          weight: 80.0,
          muscle: 52.1,
          fat: 18.5,
          saturated_fat: 10.2,
          visceral_fat: 6.8,
          bmr: 1850,
          body_age: 32,
          advice: 'Focus on strength training and reduce body fat percentage'
        }
      ];

      for (const assessment of sampleAssessments) {
        await pool.query(`
          INSERT INTO body_assessments (
            client_name, date_of_birth, age, height, bp, bp_after_treadmill,
            emergency_contact, bmi, weight, muscle, fat, saturated_fat,
            visceral_fat, bmr, body_age, advice
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        `, [
          assessment.client_name, assessment.date_of_birth, assessment.age,
          assessment.height, assessment.bp, assessment.bp_after_treadmill,
          assessment.emergency_contact, assessment.bmi, assessment.weight,
          assessment.muscle, assessment.fat, assessment.saturated_fat,
          assessment.visceral_fat, assessment.bmr, assessment.body_age, assessment.advice
        ]);
      }
      console.log('Sample body assessments inserted');
    }

    // Insert sample member sessions
    const { rows: existingSessions } = await pool.query('SELECT COUNT(*) FROM member_sessions');
    if (parseInt(existingSessions[0].count) === 0) {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const sampleSessions = [
        {
          member_name: 'dhyey patel',
          session_type: 'cardio',
          scheduled_date: tomorrow.toISOString().split('T')[0],
          scheduled_time: '10:00',
          duration: 60,
          status: 'scheduled',
          notes: 'Focus on cardiovascular endurance',
          trainer_name: 'Trainer Pro'
        },
        {
          member_name: 'John Smith',
          session_type: 'Strength Training',
          scheduled_date: today.toISOString().split('T')[0],
          scheduled_time: '14:30',
          duration: 90,
          status: 'confirmed',
          notes: 'Upper body workout session',
          trainer_name: 'Trainer Pro'
        },
        {
          member_name: 'Sarah Johnson',
          session_type: 'Personal Training',
          scheduled_date: tomorrow.toISOString().split('T')[0],
          scheduled_time: '09:00',
          duration: 60,
          status: 'pending',
          notes: 'Initial assessment and goal setting',
          trainer_name: 'Trainer Pro'
        }
      ];

      for (const session of sampleSessions) {
        await pool.query(`
          INSERT INTO member_sessions (
            member_name, session_type, scheduled_date, scheduled_time,
            duration, status, notes, trainer_name
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          session.member_name, session.session_type, session.scheduled_date,
          session.scheduled_time, session.duration, session.status,
          session.notes, session.trainer_name
        ]);
      }
      console.log('Sample member sessions inserted');
    }

    console.log('Sample data initialization completed successfully');
  } catch (error) {
    console.error('Error inserting sample data:', error);
  }
}

export async function closeDatabase() {
  try {
    await pool.end();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error closing database:', error);
  }
}