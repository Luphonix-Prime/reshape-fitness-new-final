
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
      membership_tier_id INTEGER REFERENCES membership_tiers(id),
      fitness_goals TEXT,
      emergency_contact VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createTrainerProfilesTable = `
    CREATE TABLE IF NOT EXISTS trainer_profiles (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
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
    createAttendanceTable
  ];

  for (const table of tables) {
    await pool.query(table);
  }
}

async function insertSampleData() {
  try {
    // Check if data already exists
    const { rows: existingTiers } = await pool.query('SELECT COUNT(*) FROM membership_tiers');
    if (parseInt(existingTiers[0].count) > 0) {
      console.log('Sample data already exists, skipping insertion');
      return;
    }

    // Insert membership tiers
    const tierInserts = [
      {
        name: 'BRONZE',
        price: 199,
        features: ['Access to gym equipment', 'Locker room access', 'Basic fitness assessment'],
        description: 'Perfect for getting started on your fitness journey'
      },
      {
        name: 'SILVER',
        price: 299,
        features: ['Everything in Bronze', '2 personal training sessions/month', 'Nutrition consultation', 'Group classes'],
        description: 'Enhanced experience with personal guidance'
      },
      {
        name: 'GOLD',
        price: 499,
        features: ['Everything in Silver', 'Unlimited personal training', 'Custom meal plans', 'Recovery services', '24/7 gym access'],
        description: 'The ultimate luxury fitness experience'
      }
    ];

    for (const tier of tierInserts) {
      await pool.query(
        'INSERT INTO membership_tiers (name, price, features, description) VALUES ($1, $2, $3, $4)',
        [tier.name, tier.price, tier.features, tier.description]
      );
    }

    // Insert sample users
    const userInserts = [
      {
        email: 'admin@reshape.com',
        firstName: 'Admin',
        lastName: 'User',
        userType: 'admin'
      },
      {
        email: 'trainer@reshape.com',
        firstName: 'Trainer',
        lastName: 'Pro',
        userType: 'trainer'
      },
      {
        email: 'member@reshape.com',
        firstName: 'Member',
        lastName: 'Test',
        userType: 'member'
      }
    ];

    for (const user of userInserts) {
      await pool.query(
        'INSERT INTO users (email, first_name, last_name, user_type) VALUES ($1, $2, $3, $4)',
        [user.email, user.firstName, user.lastName, user.userType]
      );
    }

    console.log('Sample data inserted successfully');
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
