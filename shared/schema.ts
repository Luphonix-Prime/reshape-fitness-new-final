
import { sql, relations, eq } from 'drizzle-orm';
import {
  index,
  text,
  sqliteTable,
  integer,
  real,
  blob,
} from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = sqliteTable(
  "sessions",
  {
    sid: text("sid").primaryKey(),
    sess: text("sess", { mode: "json" }).notNull(),
    expire: integer("expire", { mode: "timestamp" }).notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth with role support
export const users = sqliteTable("users", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  email: text("email").unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  userType: text("user_type", { enum: ["member", "trainer", "admin"] }).default("member").notNull(),
  phone: text("phone"),
  dateOfBirth: text("date_of_birth"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

// Membership tiers
export const membershipTiers = sqliteTable("membership_tiers", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  name: text("name").notNull(),
  monthlyPrice: real("monthly_price").notNull(),
  annualPrice: real("annual_price").notNull(),
  benefits: text("benefits", { mode: "json" }).notNull(),
  maxGuests: integer("max_guests").default(0),
  personalTrainingIncluded: integer("personal_training_included").default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

// Member profiles
export const memberProfiles = sqliteTable("member_profiles", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  membershipTierId: text("membership_tier_id").references(() => membershipTiers.id),
  assignedTrainerId: text("assigned_trainer_id").references(() => trainerProfiles.id),
  joinDate: integer("join_date", { mode: "timestamp" }).default(sql`(unixepoch())`),
  fitnessGoals: text("fitness_goals"),
  medicalConditions: text("medical_conditions"),
  emergencyContact: text("emergency_contact"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

// Trainer profiles
export const trainerProfiles = sqliteTable("trainer_profiles", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  specializations: text("specializations", { mode: "json" }),
  certifications: text("certifications"),
  experienceYears: integer("experience_years"),
  hourlyRate: real("hourly_rate"),
  bio: text("bio"),
  isAvailable: integer("is_available", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

// Subscriptions
export const subscriptions = sqliteTable("subscriptions", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  memberId: text("member_id").notNull().references(() => memberProfiles.id, { onDelete: "cascade" }),
  membershipTierId: text("membership_tier_id").notNull().references(() => membershipTiers.id),
  startDate: integer("start_date", { mode: "timestamp" }).notNull(),
  endDate: integer("end_date", { mode: "timestamp" }).notNull(),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  autoRenew: integer("auto_renew", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

// Training sessions
export const trainingSessions = sqliteTable("training_sessions", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  trainerId: text("trainer_id").notNull().references(() => trainerProfiles.id),
  memberId: text("member_id").notNull().references(() => memberProfiles.id),
  date: text("date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  sessionType: text("session_type"),
  status: text("status").default("scheduled"),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

// Workout plans
export const workoutPlans = sqliteTable("workout_plans", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  trainerId: text("trainer_id").notNull().references(() => trainerProfiles.id),
  memberId: text("member_id").notNull().references(() => memberProfiles.id),
  title: text("title").notNull(),
  description: text("description"),
  exercises: text("exercises", { mode: "json" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

// Nutrition plans
export const nutritionPlans = sqliteTable("nutrition_plans", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  trainerId: text("trainer_id").notNull().references(() => trainerProfiles.id),
  memberId: text("member_id").notNull().references(() => memberProfiles.id),
  title: text("title").notNull(),
  dailyCalories: integer("daily_calories"),
  meals: text("meals", { mode: "json" }).notNull(),
  dietaryRestrictions: text("dietary_restrictions"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

// Relations
export const usersRelations = relations(users, ({ one }) => ({
  memberProfile: one(memberProfiles, {
    fields: [users.id],
    references: [memberProfiles.userId],
  }),
  trainerProfile: one(trainerProfiles, {
    fields: [users.id],
    references: [trainerProfiles.userId],
  }),
}));

export const memberProfilesRelations = relations(memberProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [memberProfiles.userId],
    references: [users.id],
  }),
  membershipTier: one(membershipTiers, {
    fields: [memberProfiles.membershipTierId],
    references: [membershipTiers.id],
  }),
  assignedTrainer: one(trainerProfiles, {
    fields: [memberProfiles.assignedTrainerId],
    references: [trainerProfiles.id],
  }),
  subscriptions: many(subscriptions),
  trainingSessions: many(trainingSessions),
  workoutPlans: many(workoutPlans),
  nutritionPlans: many(nutritionPlans),
}));

export const trainerProfilesRelations = relations(trainerProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [trainerProfiles.userId],
    references: [users.id],
  }),
  assignedMembers: many(memberProfiles),
  trainingSessions: many(trainingSessions),
  workoutPlans: many(workoutPlans),
  nutritionPlans: many(nutritionPlans),
}));

export const membershipTiersRelations = relations(membershipTiers, ({ many }) => ({
  memberProfiles: many(memberProfiles),
  subscriptions: many(subscriptions),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  member: one(memberProfiles, {
    fields: [subscriptions.memberId],
    references: [memberProfiles.id],
  }),
  membershipTier: one(membershipTiers, {
    fields: [subscriptions.membershipTierId],
    references: [membershipTiers.id],
  }),
}));

export const trainingSessionsRelations = relations(trainingSessions, ({ one }) => ({
  trainer: one(trainerProfiles, {
    fields: [trainingSessions.trainerId],
    references: [trainerProfiles.id],
  }),
  member: one(memberProfiles, {
    fields: [trainingSessions.memberId],
    references: [memberProfiles.id],
  }),
}));

export const workoutPlansRelations = relations(workoutPlans, ({ one }) => ({
  trainer: one(trainerProfiles, {
    fields: [workoutPlans.trainerId],
    references: [trainerProfiles.id],
  }),
  member: one(memberProfiles, {
    fields: [workoutPlans.memberId],
    references: [memberProfiles.id],
  }),
}));

export const nutritionPlansRelations = relations(nutritionPlans, ({ one }) => ({
  trainer: one(trainerProfiles, {
    fields: [nutritionPlans.trainerId],
    references: [trainerProfiles.id],
  }),
  member: one(memberProfiles, {
    fields: [nutritionPlans.memberId],
    references: [memberProfiles.id],
  }),
}));

// Type exports
export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;
export type MembershipTier = typeof membershipTiers.$inferSelect;
export type InsertMembershipTier = typeof membershipTiers.$inferInsert;
export type MemberProfile = typeof memberProfiles.$inferSelect;
export type InsertMemberProfile = typeof memberProfiles.$inferInsert;
export type TrainerProfile = typeof trainerProfiles.$inferSelect;
export type InsertTrainerProfile = typeof trainerProfiles.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;
export type TrainingSession = typeof trainingSessions.$inferSelect;
export type InsertTrainingSession = typeof trainingSessions.$inferInsert;
export type WorkoutPlan = typeof workoutPlans.$inferSelect;
export type InsertWorkoutPlan = typeof workoutPlans.$inferInsert;
export type NutritionPlan = typeof nutritionPlans.$inferSelect;
export type InsertNutritionPlan = typeof nutritionPlans.$inferInsert;

// Schema exports for forms
export const insertUserSchema = createInsertSchema(users);
export const insertMembershipTierSchema = createInsertSchema(membershipTiers);
export const insertMemberProfileSchema = createInsertSchema(memberProfiles);
export const insertTrainerProfileSchema = createInsertSchema(trainerProfiles);
export const insertSubscriptionSchema = createInsertSchema(subscriptions);
export const insertTrainingSessionSchema = createInsertSchema(trainingSessions);
export const insertWorkoutPlanSchema = createInsertSchema(workoutPlans);
export const insertNutritionPlanSchema = createInsertSchema(nutritionPlans);
