import {
  users,
  membershipTiers,
  memberProfiles,
  trainerProfiles,
  trainingSessions,
  workoutPlans,
  nutritionPlans,
  subscriptions,
  type User,
  type UpsertUser,
  type MembershipTier,
  type InsertMembershipTier,
  type MemberProfile,
  type InsertMemberProfile,
  type TrainerProfile,
  type InsertTrainerProfile,
  type TrainingSession,
  type InsertTrainingSession,
  type WorkoutPlan,
  type InsertWorkoutPlan,
  type NutritionPlan,
  type InsertNutritionPlan,
  type Subscription,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  createUser(userData: Omit<UpsertUser, 'id'>): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User>;
  deleteUser(userId: string): Promise<void>;

  // Membership tier operations
  getMembershipTiers(): Promise<MembershipTier[]>;
  getMembershipTier(id: string): Promise<MembershipTier | undefined>;
  createMembershipTier(tier: InsertMembershipTier): Promise<MembershipTier>;

  // Member profile operations
  getMemberProfile(userId: string): Promise<MemberProfile | undefined>;
  createMemberProfile(profile: InsertMemberProfile): Promise<MemberProfile>;
  updateMemberProfile(id: string, profile: Partial<InsertMemberProfile>): Promise<MemberProfile>;

  // Trainer profile operations
  getTrainerProfile(userId: string): Promise<TrainerProfile | undefined>;
  getTrainerProfiles(): Promise<TrainerProfile[]>;
  createTrainerProfile(profile: InsertTrainerProfile): Promise<TrainerProfile>;
  updateTrainerProfile(id: string, profile: Partial<InsertTrainerProfile>): Promise<TrainerProfile>;

  // Training session operations
  getTrainingSessions(filters: { trainerId?: string; memberId?: string }): Promise<TrainingSession[]>;
  createTrainingSession(session: InsertTrainingSession): Promise<TrainingSession>;
  updateTrainingSession(id: string, session: Partial<InsertTrainingSession>): Promise<TrainingSession>;

  // Workout plan operations
  getWorkoutPlans(filters: { trainerId?: string; memberId?: string }): Promise<WorkoutPlan[]>;
  createWorkoutPlan(plan: InsertWorkoutPlan): Promise<WorkoutPlan>;

  // Nutrition plan operations
  getNutritionPlans(filters: { trainerId?: string; memberId?: string }): Promise<NutritionPlan[]>;
  createNutritionPlan(plan: InsertNutritionPlan): Promise<NutritionPlan>;

  // Subscription operations
  getUserSubscription(memberId: string): Promise<Subscription | undefined>;
  createSubscription(subscription: Partial<Subscription>): Promise<Subscription>;

  // Admin operations
  getAllMembers(): Promise<any[]>;
  getAllTrainers(): Promise<any[]>;
  getAdminStats(): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async createUser(userData: Omit<UpsertUser, 'id'>): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        stripeCustomerId,
        stripeSubscriptionId,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async deleteUser(userId: string): Promise<void> {
    // Delete user (this will cascade delete profiles due to foreign key constraints)
    await db.delete(users).where(eq(users.id, userId));
  }

  // Membership tier operations
  async getMembershipTiers(): Promise<MembershipTier[]> {
    return await db.select().from(membershipTiers);
  }

  async getMembershipTier(id: string): Promise<MembershipTier | undefined> {
    const [tier] = await db.select().from(membershipTiers).where(eq(membershipTiers.id, id));
    return tier;
  }

  async createMembershipTier(tier: InsertMembershipTier): Promise<MembershipTier> {
    const [newTier] = await db.insert(membershipTiers).values(tier).returning();
    return newTier;
  }

  // Member profile operations
  async getMemberProfile(userId: string): Promise<MemberProfile | undefined> {
    const [profile] = await db.select().from(memberProfiles).where(eq(memberProfiles.userId, userId));
    return profile;
  }

  async createMemberProfile(profile: InsertMemberProfile): Promise<MemberProfile> {
    const [newProfile] = await db.insert(memberProfiles).values(profile).returning();
    return newProfile;
  }

  async updateMemberProfile(id: string, profile: Partial<InsertMemberProfile>): Promise<MemberProfile> {
    const [updatedProfile] = await db
      .update(memberProfiles)
      .set(profile)
      .where(eq(memberProfiles.id, id))
      .returning();
    return updatedProfile;
  }

  // Trainer profile operations
  async getTrainerProfile(userId: string): Promise<TrainerProfile | undefined> {
    const [profile] = await db.select().from(trainerProfiles).where(eq(trainerProfiles.userId, userId));
    return profile;
  }

  async getTrainerProfiles(): Promise<TrainerProfile[]> {
    return await db.select().from(trainerProfiles).where(eq(trainerProfiles.isAvailable, true));
  }

  async createTrainerProfile(profile: InsertTrainerProfile): Promise<TrainerProfile> {
    const [newProfile] = await db.insert(trainerProfiles).values(profile).returning();
    return newProfile;
  }

  async updateTrainerProfile(id: string, profile: Partial<InsertTrainerProfile>): Promise<TrainerProfile> {
    const [updatedProfile] = await db
      .update(trainerProfiles)
      .set(profile)
      .where(eq(trainerProfiles.id, id))
      .returning();
    return updatedProfile;
  }

  // Training session operations
  async getTrainingSessions(filters: { trainerId?: string; memberId?: string }): Promise<TrainingSession[]> {
    if (filters.trainerId && filters.memberId) {
      return await db.select().from(trainingSessions).where(and(
        eq(trainingSessions.trainerId, filters.trainerId),
        eq(trainingSessions.memberId, filters.memberId)
      ));
    } else if (filters.trainerId) {
      return await db.select().from(trainingSessions).where(eq(trainingSessions.trainerId, filters.trainerId));
    } else if (filters.memberId) {
      return await db.select().from(trainingSessions).where(eq(trainingSessions.memberId, filters.memberId));
    }

    return await db.select().from(trainingSessions);
  }

  async createTrainingSession(session: InsertTrainingSession): Promise<TrainingSession> {
    const [newSession] = await db.insert(trainingSessions).values(session).returning();
    return newSession;
  }

  async updateTrainingSession(id: string, session: Partial<InsertTrainingSession>): Promise<TrainingSession> {
    const [updatedSession] = await db
      .update(trainingSessions)
      .set(session)
      .where(eq(trainingSessions.id, id))
      .returning();
    return updatedSession;
  }

  // Workout plan operations
  async getWorkoutPlans(filters: { trainerId?: string; memberId?: string }): Promise<WorkoutPlan[]> {
    if (filters.trainerId && filters.memberId) {
      return await db.select().from(workoutPlans).where(and(
        eq(workoutPlans.trainerId, filters.trainerId),
        eq(workoutPlans.memberId, filters.memberId)
      ));
    } else if (filters.trainerId) {
      return await db.select().from(workoutPlans).where(eq(workoutPlans.trainerId, filters.trainerId));
    } else if (filters.memberId) {
      return await db.select().from(workoutPlans).where(eq(workoutPlans.memberId, filters.memberId));
    }

    return await db.select().from(workoutPlans);
  }

  async createWorkoutPlan(plan: InsertWorkoutPlan): Promise<WorkoutPlan> {
    const [newPlan] = await db.insert(workoutPlans).values(plan).returning();
    return newPlan;
  }

  // Nutrition plan operations
  async getNutritionPlans(filters: { trainerId?: string; memberId?: string }): Promise<NutritionPlan[]> {
    if (filters.trainerId && filters.memberId) {
      return await db.select().from(nutritionPlans).where(and(
        eq(nutritionPlans.trainerId, filters.trainerId),
        eq(nutritionPlans.memberId, filters.memberId)
      ));
    } else if (filters.trainerId) {
      return await db.select().from(nutritionPlans).where(eq(nutritionPlans.trainerId, filters.trainerId));
    } else if (filters.memberId) {
      return await db.select().from(nutritionPlans).where(eq(nutritionPlans.memberId, filters.memberId));
    }

    return await db.select().from(nutritionPlans);
  }

  async createNutritionPlan(plan: InsertNutritionPlan): Promise<NutritionPlan> {
    const [newPlan] = await db.insert(nutritionPlans).values(plan).returning();
    return newPlan;
  }

  // Subscription operations
  async getUserSubscription(memberId: string): Promise<Subscription | undefined> {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.memberId, memberId));
    return subscription;
  }

  async createSubscription(subscription: Partial<Subscription>): Promise<Subscription> {
    const [newSubscription] = await db.insert(subscriptions).values(subscription).returning();
    return newSubscription;
  }

  // Admin operations
  async getAllMembers(): Promise<any[]> {
    const members = await db
      .select({
        id: memberProfiles.id,
        userId: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        phone: users.phone,
        membershipTier: membershipTiers.name,
        joinDate: memberProfiles.joinDate,
        createdAt: users.createdAt,
        emergencyContact: memberProfiles.emergencyContact,
        fitnessGoals: memberProfiles.fitnessGoals
      })
      .from(users)
      .innerJoin(memberProfiles, eq(users.id, memberProfiles.userId))
      .leftJoin(membershipTiers, eq(memberProfiles.membershipTierId, membershipTiers.id))
      .where(eq(users.userType, 'member'));

    return members;
  }

  async getAllTrainers(): Promise<any[]> {
    const trainers = await db
      .select({
        id: trainerProfiles.id,
        userId: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        specializations: trainerProfiles.specializations,
        hourlyRate: trainerProfiles.hourlyRate,
        experienceYears: trainerProfiles.experienceYears,
        certifications: trainerProfiles.certifications,
        bio: trainerProfiles.bio,
        isAvailable: trainerProfiles.isAvailable,
        createdAt: users.createdAt
      })
      .from(users)
      .innerJoin(trainerProfiles, eq(users.id, trainerProfiles.userId))
      .where(eq(users.userType, 'trainer'));

    return trainers;
  }

  async getAdminStats(): Promise<any> {
    const totalMembers = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.userType, 'member'));

    const totalTrainers = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.userType, 'trainer'));

    const totalSessions = await db
      .select({ count: sql<number>`count(*)` })
      .from(trainingSessions);

    const activeSubscriptions = await db
      .select({ count: sql<number>`count(*)` })
      .from(subscriptions)
      .where(eq(subscriptions.isActive, true));

    return {
      totalMembers: totalMembers[0]?.count || 0,
      totalTrainers: totalTrainers[0]?.count || 0,
      totalSessions: totalSessions[0]?.count || 0,
      activeSubscriptions: activeSubscriptions[0]?.count || 0,
      monthlyRevenue: 52800, // Static for now
      growth: "+12%" // Static for now
    };
  }
}

export const storage = new DatabaseStorage();