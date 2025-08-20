import { MongoClient, Db } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer;
let client: MongoClient;
let db: Db;

export async function initializeMongoDB() {
  try {
    // Create in-memory MongoDB instance for Replit compatibility
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    client = new MongoClient(uri);
    await client.connect();
    db = client.db('gymdata');

    console.log('Connected to MongoDB (in-memory)');

    // Initialize collections and sample data
    await initializeCollections();

    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export async function initializeCollections() {
  // Create membership tiers collection
  const membershipTiers = db.collection('membershipTiers');
  await membershipTiers.deleteMany({}); // Clear existing data

  const sampleTiers = [
    {
      name: "Access",
      monthlyPrice: 200.00,
      annualPrice: 2000.00,
      benefits: ["Full gym access", "Group fitness classes", "Locker room amenities", "Basic wellness services"],
      maxGuests: 0,
      personalTrainingIncluded: 0,
      createdAt: new Date()
    },
    {
      name: "All Access",
      monthlyPrice: 300.00,
      annualPrice: 3000.00,
      benefits: ["Multiple location access", "Personal training sessions", "Spa services included", "Nutrition consultations", "Guest privileges"],
      maxGuests: 2,
      personalTrainingIncluded: 2,
      createdAt: new Date()
    },
    {
      name: "Executive",
      monthlyPrice: 500.00,
      annualPrice: 5000.00,
      benefits: ["VIP lounge access", "Unlimited personal training", "Concierge services", "Exclusive events", "Priority booking"],
      maxGuests: 5,
      personalTrainingIncluded: 999,
      createdAt: new Date()
    }
  ];

  await membershipTiers.insertMany(sampleTiers);

  // Create users collection
  const users = db.collection('users');
  await users.deleteMany({});

  const sampleUsers = [
    {
      email: "john.doe@example.com",
      firstName: "John",
      lastName: "Doe",
      userType: "member",
      phone: "+1-555-0123",
      createdAt: new Date()
    },
    {
      email: "jane.trainer@example.com",
      firstName: "Jane",
      lastName: "Smith",
      userType: "trainer",
      phone: "+1-555-0124",
      createdAt: new Date()
    },
    {
      email: "admin@reshape.com",
      firstName: "Admin",
      lastName: "User",
      userType: "admin",
      phone: "+1-555-0125",
      createdAt: new Date()
    }
  ];

  const insertedUsers = await users.insertMany(sampleUsers);

  // Create member profiles collection
  const memberProfiles = db.collection('memberProfiles');
  await memberProfiles.deleteMany({});

  const accessTier = await membershipTiers.findOne({ name: "Access" });
  const memberUser = await users.findOne({ email: "john.doe@example.com" });

  if (memberUser && accessTier) {
    await memberProfiles.insertOne({
      userId: memberUser._id,
      membershipTierId: accessTier._id,
      emergencyContact: "emergency@example.com",
      fitnessGoals: "General fitness and weight loss",
      joinDate: new Date(),
      createdAt: new Date()
    });
  }

  // Create trainer profiles collection
  const trainerProfiles = db.collection('trainerProfiles');
  await trainerProfiles.deleteMany({});

  const trainerUser = await users.findOne({ email: "jane.trainer@example.com" });
  if (trainerUser) {
    await trainerProfiles.insertOne({
      userId: trainerUser._id,
      specializations: ["Weight Training", "Cardio", "Nutrition"],
      certifications: "NASM-CPT, Nutrition Specialist",
      experienceYears: 5,
      hourlyRate: 75.00,
      bio: "Experienced personal trainer specializing in weight loss and strength training.",
      isAvailable: true,
      createdAt: new Date()
    });
  }

  // Create contact submissions (inquiries) collection with sample data
  const contactSubmissions = db.collection('contact_submissions');
  await contactSubmissions.deleteMany({});

  const sampleInquiries = [
    {
      firstName: "David",
      lastName: "Wilson",
      email: "david.wilson@example.com",
      phone: "+1-555-0200",
      location: "downtown",
      interest: "personal-training",
      message: "I'm interested in personal training sessions to help with weight loss and muscle building. I have some experience with gym workouts but need professional guidance.",
      submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      status: 'new'
    },
    {
      firstName: "Lisa",
      lastName: "Chen",
      email: "lisa.chen@example.com",
      phone: "+1-555-0201",
      location: "miami-beach",
      interest: "membership",
      message: "Looking for a comprehensive membership plan that includes access to all facilities and group fitness classes. Can you provide more information about your All Access plan?",
      submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      status: 'new'
    },
    {
      firstName: "Michael",
      lastName: "Rodriguez",
      email: "michael.rodriguez@example.com",
      phone: "+1-555-0202",
      location: "wynwood",
      interest: "nutrition",
      message: "I need help with meal planning and nutrition guidance. I work out regularly but struggle with my diet. Would love to discuss nutrition consultation options.",
      submittedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
      status: 'new'
    }
  ];

  await contactSubmissions.insertMany(sampleInquiries);

  // Create body assessments collection with sample data
  const bodyAssessments = db.collection('bodyAssessments');
  await bodyAssessments.deleteMany({});

  const memberUserForAssessments = await users.findOne({ email: "john.doe@example.com" });
  if (memberUserForAssessments) {
    const sampleAssessments = [
      {
        memberId: memberUserForAssessments._id,
        dateOfBirth: "1990-05-15",
        age: 34,
        height: 175,
        bloodPressure: "120/80",
        afterTreadmillBP: "140/85",
        emergencyContact: "jane.doe@example.com",
        bodyComposition: {
          bmi: 24.5,
          weight: 75,
          muscle: 45,
          fat: 15,
          saturatedFat: 8,
          visceralFat: 5,
          bmr: 1650,
          bodyAge: 32
        },
        posturalAssessment: {
          headNeckAlignment: "Good",
          shoulderAlignment: "Slight forward posture",
          upperBackAlignment: "Normal",
          lowerBackAlignment: "Good",
          pelvicAlignment: "Neutral",
          hipKneeAlignment: "Good",
          ankleAlignment: "Normal",
          spinalMobility: "Good range of motion"
        },
        circumferenceMeasurements: {
          neck: 38,
          shoulders: 112,
          chest: 98,
          upperArm: 32,
          forearms: 28,
          wrist: 17,
          waist: 85,
          hip: 95,
          thighs: 58,
          calf: 38,
          ankle: 23
        },
        recommendations: "Focus on core strengthening exercises and posture correction. Increase protein intake for muscle development.",
        advice: "Maintain current workout routine, add 2 days of strength training per week, and consider yoga for flexibility.",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 1 week ago
      },
      {
        memberId: memberUserForAssessments._id,
        dateOfBirth: "1990-05-15",
        age: 34,
        height: 175,
        bloodPressure: "118/78",
        afterTreadmillBP: "135/82",
        emergencyContact: "jane.doe@example.com",
        bodyComposition: {
          bmi: 24.2,
          weight: 74,
          muscle: 46,
          fat: 14,
          saturatedFat: 7,
          visceralFat: 4,
          bmr: 1665,
          bodyAge: 31
        },
        posturalAssessment: {
          headNeckAlignment: "Improved",
          shoulderAlignment: "Better alignment",
          upperBackAlignment: "Normal",
          lowerBackAlignment: "Good",
          pelvicAlignment: "Neutral",
          hipKneeAlignment: "Good",
          ankleAlignment: "Normal",
          spinalMobility: "Excellent range of motion"
        },
        circumferenceMeasurements: {
          neck: 37,
          shoulders: 113,
          chest: 99,
          upperArm: 33,
          forearms: 28,
          wrist: 17,
          waist: 83,
          hip: 94,
          thighs: 59,
          calf: 38,
          ankle: 23
        },
        recommendations: "Continue current program. Excellent progress in muscle gain and fat loss. Consider adding HIIT sessions.",
        advice: "Keep up the great work! Add more cardiovascular exercises and maintain consistent nutrition plan.",
        createdAt: new Date() // Today
      }
    ];

    await bodyAssessments.insertMany(sampleAssessments);
  }

  // Create attendance collection with sample data
  const attendance = db.collection('attendance');
  await attendance.deleteMany({});

  const trainerUserForAttendance = await users.findOne({ email: "jane.trainer@example.com" });
  if (trainerUserForAttendance) {
    const sampleAttendance = [];

    // Generate attendance for the last 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD format

      // Most days present, some absent, some late
      let status = 'present';
      let checkInTime = '09:00';
      let checkOutTime = '17:00';
      let notes = '';

      if (i === 3 || i === 15) { // Absent on 2 days
        status = 'absent';
        checkInTime = null;
        checkOutTime = null;
        notes = 'Sick leave';
      } else if (i === 7 || i === 12 || i === 22) { // Late on 3 days
        status = 'late';
        checkInTime = '09:30';
        checkOutTime = '17:30';
        notes = 'Traffic delay';
      } else if (i === 0 || i === 5 || i === 10) { // Early checkout on 3 days
        checkOutTime = '16:00';
        notes = 'Early checkout - personal appointment';
      }

      sampleAttendance.push({
        trainerId: trainerUserForAttendance._id,
        date: dateString,
        status: status,
        checkInTime: checkInTime,
        checkOutTime: checkOutTime,
        notes: notes,
        createdAt: new Date(date)
      });
    }

    await attendance.insertMany(sampleAttendance);
  }

  console.log("MongoDB collections initialized with sample data including inquiries, body assessments, and attendance");
}

export function getDB() {
  if (!db) {
    throw new Error('Database not initialized. Call initializeMongoDB first.');
  }
  return db;
}

export async function closeMongoDB() {
  if (client) {
    await client.close();
  }
  if (mongod) {
    await mongod.stop();
  }
}