import { ObjectId } from 'mongodb';
import { getDB } from './mongodb.js';

export class MongoStorage {
  private get db() {
    return getDB();
  }

  // Users
  async createUser(userData: any) {
    const users = this.db.collection('users');
    const result = await users.insertOne({
      ...userData,
      createdAt: new Date()
    });
    return await users.findOne({ _id: result.insertedId });
  }

  async getUser(userId: string) {
    const users = this.db.collection('users');
    return await users.findOne({ _id: new ObjectId(userId) });
  }

  async getUserByEmail(email: string) {
    const users = this.db.collection('users');
    return await users.findOne({ email });
  }

  async updateUserStripeInfo(userId: string, customerId: string, subscriptionId?: string) {
    const users = this.db.collection('users');
    return await users.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          updatedAt: new Date()
        }
      }
    );
  }

  // Membership Tiers
  async getMembershipTiers() {
    const tiers = this.db.collection('membershipTiers');
    return await tiers.find({}).toArray();
  }

  async getMembershipTier(tierId: string) {
    const tiers = this.db.collection('membershipTiers');
    return await tiers.findOne({ _id: new ObjectId(tierId) });
  }

  async createMembershipTier(tierData: any) {
    const tiers = this.db.collection('membershipTiers');
    const result = await tiers.insertOne({
      ...tierData,
      createdAt: new Date()
    });
    return await tiers.findOne({ _id: result.insertedId });
  }

  // Member Profiles
  async getMemberProfile(userId: string) {
    const profiles = this.db.collection('memberProfiles');
    return await profiles.findOne({ userId: new ObjectId(userId) });
  }

  async createMemberProfile(profileData: any) {
    const profiles = this.db.collection('memberProfiles');
    const result = await profiles.insertOne({
      ...profileData,
      userId: new ObjectId(profileData.userId),
      membershipTierId: profileData.membershipTierId ? new ObjectId(profileData.membershipTierId) : null,
      createdAt: new Date()
    });
    return await profiles.findOne({ _id: result.insertedId });
  }

  async updateMemberProfile(userId: string, updates: any) {
    const profiles = this.db.collection('memberProfiles');
    return await profiles.updateOne(
      { userId: new ObjectId(userId) },
      { $set: { ...updates, updatedAt: new Date() } }
    );
  }

  // Trainer Profiles
  async getTrainerProfile(userId: string) {
    const profiles = this.db.collection('trainerProfiles');
    return await profiles.findOne({ userId: new ObjectId(userId) });
  }

  async getTrainerProfiles() {
    const profiles = this.db.collection('trainerProfiles');
    const users = this.db.collection('users');

    const trainers = await profiles.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      }
    ]).toArray();

    return trainers;
  }

  async createTrainerProfile(profileData: any) {
    const profiles = this.db.collection('trainerProfiles');
    const result = await profiles.insertOne({
      ...profileData,
      userId: new ObjectId(profileData.userId),
      createdAt: new Date()
    });
    return await profiles.findOne({ _id: result.insertedId });
  }

  // Training Sessions
  async createTrainingSession(sessionData: any) {
    const sessions = this.db.collection('trainingSessions');
    const result = await sessions.insertOne({
      ...sessionData,
      memberId: new ObjectId(sessionData.memberId),
      trainerId: new ObjectId(sessionData.trainerId),
      createdAt: new Date()
    });
    return await sessions.findOne({ _id: result.insertedId });
  }

  async getTrainingSessionsByMember(memberId: string) {
    const sessions = this.db.collection('trainingSessions');
    return await sessions.find({ memberId: new ObjectId(memberId) }).toArray();
  }

  async getTrainingSessionsByTrainer(trainerId: string) {
    const sessions = this.db.collection('trainingSessions');
    return await sessions.find({ trainerId: new ObjectId(trainerId) }).toArray();
  }

  // Subscriptions
  async createSubscription(subscriptionData: any) {
    const subscriptions = this.db.collection('subscriptions');
    const result = await subscriptions.insertOne({
      ...subscriptionData,
      memberId: new ObjectId(subscriptionData.memberId),
      membershipTierId: new ObjectId(subscriptionData.membershipTierId),
      createdAt: new Date()
    });
    return await subscriptions.findOne({ _id: result.insertedId });
  }

  async getActiveSubscription(memberId: string) {
    const subscriptions = this.db.collection('subscriptions');
    return await subscriptions.findOne({
      memberId: new ObjectId(memberId),
      isActive: true
    });
  }

  // Workout Plans
  async createWorkoutPlan(planData: any) {
    const plans = this.db.collection('workoutPlans');
    const result = await plans.insertOne({
      ...planData,
      trainerId: new ObjectId(planData.trainerId),
      memberId: new ObjectId(planData.memberId),
      createdAt: new Date()
    });
    return await plans.findOne({ _id: result.insertedId });
  }

  async getWorkoutPlansByMember(memberId: string) {
    const plans = this.db.collection('workoutPlans');
    return await plans.find({ memberId: new ObjectId(memberId) }).toArray();
  }

  // Nutrition Plans
  async createNutritionPlan(planData: any) {
    const plans = this.db.collection('nutritionPlans');
    const result = await plans.insertOne({
      ...planData,
      trainerId: new ObjectId(planData.trainerId),
      memberId: new ObjectId(planData.memberId),
      createdAt: new Date()
    });
    return await plans.findOne({ _id: result.insertedId });
  }

  async getNutritionPlansByMember(memberId: string) {
    const plans = this.db.collection('nutritionPlans');
    return await plans.find({ memberId: new ObjectId(memberId) }).toArray();
  }

  async getWorkoutPlansByTrainer(trainerId: string) {
    const plans = this.db.collection('workoutPlans');
    return await plans.find({ trainerId: new ObjectId(trainerId) }).toArray();
  }

  async getNutritionPlansByTrainer(trainerId: string) {
    const plans = this.db.collection('nutritionPlans');
    return await plans.find({ trainerId: new ObjectId(trainerId) }).toArray();
  }

  async getUserSubscriptions(userId: string) {
    const subscriptions = await this.db.collection('subscriptions').find({ userId }).toArray();
    return subscriptions;
  }

  // Store contact form submission
  async storeContactSubmission(submission: any) {
    const result = await this.db.collection('contact_submissions').insertOne({
      ...submission,
      status: 'new',
      createdAt: new Date()
    });
    return result;
  }

  // Get contact submissions (for admin use)
  async getContactSubmissions() {
    const submissions = await this.db.collection('contact_submissions').find({}).sort({ submittedAt: -1 }).toArray();
    return submissions;
  }

  // Inquiry management methods
  async getAllInquiries() {
    const inquiries = this.db.collection('contact_submissions');
    return await inquiries.find({ status: { $ne: 'cancelled' } }).sort({ submittedAt: -1 }).toArray();
  }

  async getInquiryById(inquiryId: string) {
    const inquiries = this.db.collection('contact_submissions');
    return await inquiries.findOne({ _id: new ObjectId(inquiryId) });
  }

  async updateInquiryStatus(inquiryId: string, status: string) {
    const inquiries = this.db.collection('contact_submissions');
    return await inquiries.updateOne(
      { _id: new ObjectId(inquiryId) },
      { 
        $set: { 
          status: status,
          updatedAt: new Date()
        }
      }
    );
  }

  async convertInquiryToMember(inquiryId: string, memberData: any, assessmentData: any) {
    const inquiries = this.db.collection('contact_submissions');
    const inquiry = await this.getInquiryById(inquiryId);
    
    if (!inquiry) {
      throw new Error('Inquiry not found');
    }

    // Create user from inquiry data
    const newUser = await this.createUser({
      email: inquiry.email,
      firstName: inquiry.firstName,
      lastName: inquiry.lastName,
      userType: 'member',
      phone: inquiry.phone || null
    });

    // Create member profile
    const memberProfile = await this.createMemberProfile({
      userId: newUser._id.toString(),
      membershipTierId: memberData.membershipTierId,
      emergencyContact: inquiry.phone || inquiry.email,
      fitnessGoals: inquiry.interest || "General fitness improvement"
    });

    // Create subscription for the new member
    const subscription = await this.createSubscription({
      memberId: memberProfile._id.toString(),
      membershipTierId: memberData.membershipTierId,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      isActive: true,
      autoRenew: true
    });

    // Create body assessment if provided
    if (assessmentData && Object.keys(assessmentData).length > 0) {
      await this.createBodyAssessment({
        ...assessmentData,
        memberId: newUser._id.toString()
      });
    }

    // Update inquiry status
    await this.updateInquiryStatus(inquiryId, 'converted');

    // Get membership tier details for email
    const membershipTier = await this.getMembershipTier(memberData.membershipTierId);
    
    // Send welcome email (async - don't wait for it)
    try {
      const { emailService } = require('./emailService');
      await emailService.sendWelcomeEmail(
        inquiry.email,
        `${inquiry.firstName} ${inquiry.lastName}`,
        membershipTier?.name || 'Premium'
      );
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't throw error - conversion should still succeed even if email fails
    }

    return { user: newUser, profile: memberProfile };
  }

  async deleteInquiry(inquiryId: string) {
    const inquiries = this.db.collection('contact_submissions');
    // Mark as cancelled instead of deleting
    return await inquiries.updateOne(
      { _id: new ObjectId(inquiryId) },
      { 
        $set: { 
          status: 'cancelled',
          cancelledAt: new Date(),
          updatedAt: new Date()
        }
      }
    );
  }

  // Check for expiring memberships and send reminder emails
  async checkAndNotifyExpiringMemberships() {
    const subscriptions = this.db.collection('subscriptions');
    const memberProfiles = this.db.collection('memberProfiles');
    const users = this.db.collection('users');
    const membershipTiers = this.db.collection('membershipTiers');

    // Find subscriptions expiring in 7 days or 1 day
    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const oneDayFromNow = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);
    const today = new Date();
    
    const expiringSubscriptions = await subscriptions.find({
      isActive: true,
      endDate: {
        $gte: today,
        $lte: sevenDaysFromNow
      }
    }).toArray();

    for (const subscription of expiringSubscriptions) {
      try {
        // Get member and user details
        const memberProfile = await memberProfiles.findOne({ _id: new ObjectId(subscription.memberId) });
        if (!memberProfile) continue;

        const user = await users.findOne({ _id: new ObjectId(memberProfile.userId) });
        if (!user) continue;

        const membershipTier = await membershipTiers.findOne({ _id: new ObjectId(subscription.membershipTierId) });
        if (!membershipTier) continue;

        // Calculate days until expiration
        const daysUntilExpiration = Math.ceil((new Date(subscription.endDate).getTime() - Date.now()) / (1000 * 3600 * 24));
        
        // Only send reminders for 7 days and 1 day before expiration
        if (daysUntilExpiration === 7 || daysUntilExpiration === 1) {
          // Check if we've already sent a reminder for this timeframe
          const reminderKey = `${subscription._id}_${daysUntilExpiration}days`;
          const existingReminder = await this.db.collection('email_reminders').findOne({ reminderKey });
          
          if (!existingReminder) {
            // Send reminder email
            const { emailService } = require('./emailService');
            await emailService.sendMembershipExpirationReminder(
              user.email,
              `${user.firstName} ${user.lastName}`,
              membershipTier.name,
              daysUntilExpiration
            );

            // Record that we sent this reminder
            await this.db.collection('email_reminders').insertOne({
              reminderKey,
              subscriptionId: subscription._id.toString(),
              memberId: subscription.memberId,
              sentAt: new Date(),
              reminderType: 'expiration',
              daysBeforeExpiration: daysUntilExpiration
            });

            console.log(`Sent expiration reminder to ${user.email} (${daysUntilExpiration} days)`);
          }
        }
      } catch (error) {
        console.error('Error sending expiration reminder:', error);
        // Continue with next subscription even if one fails
      }
    }

    return { processed: expiringSubscriptions.length };
  }

  // Admin methods
  async getAllMembers() {
    const memberProfiles = this.db.collection('memberProfiles');
    const users = this.db.collection('users');
    const membershipTiers = this.db.collection('membershipTiers');

    const members = await memberProfiles.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $lookup: {
          from: 'membershipTiers',
          localField: 'membershipTierId',
          foreignField: '_id',
          as: 'membershipTierInfo'
        }
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: '$membershipTierInfo',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          userId: '$user._id',
          firstName: '$user.firstName',
          lastName: '$user.lastName',
          email: '$user.email',
          phone: '$user.phone',
          membershipTier: '$membershipTierInfo.name',
          membershipTierId: '$membershipTierId',
          joinDate: '$joinDate',
          fitnessGoals: '$fitnessGoals',
          emergencyContact: '$emergencyContact',
          createdAt: '$createdAt'
        }
      }
    ]).toArray();

    return members;
  }

  async getAllTrainers() {
    const trainerProfiles = this.db.collection('trainerProfiles');
    const users = this.db.collection('users');

    const trainers = await trainerProfiles.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          userId: '$user._id',
          firstName: '$user.firstName',
          lastName: '$user.lastName',
          email: '$user.email',
          phone: '$user.phone',
          specializations: '$specializations',
          hourlyRate: '$hourlyRate',
          experienceYears: '$experienceYears',
          certifications: '$certifications',
          bio: '$bio',
          isAvailable: '$isAvailable',
          createdAt: '$createdAt'
        }
      }
    ]).toArray();

    return trainers;
  }

  async getAdminStats() {
    const members = this.db.collection('memberProfiles');
    const trainers = this.db.collection('trainerProfiles');
    const sessions = this.db.collection('trainingSessions');
    const subscriptions = this.db.collection('subscriptions');
    const membershipTiers = this.db.collection('membershipTiers');

    const [
      totalMembers,
      totalTrainers,
      totalSessions,
      activeSubscriptions,
      tiers
    ] = await Promise.all([
      members.countDocuments(),
      trainers.countDocuments(),
      sessions.countDocuments(),
      subscriptions.countDocuments({ isActive: true }),
      membershipTiers.find({}).toArray()
    ]);

    // Calculate monthly revenue from active subscriptions
    const activeSubscriptionData = await subscriptions.aggregate([
      {
        $match: { isActive: true }
      },
      {
        $lookup: {
          from: 'membershipTiers',
          localField: 'membershipTierId',
          foreignField: '_id',
          as: 'tier'
        }
      },
      {
        $unwind: '$tier'
      }
    ]).toArray();

    const monthlyRevenue = activeSubscriptionData.reduce((total, sub) => {
      return total + parseFloat(sub.tier.monthlyPrice || '0');
    }, 0);

    return {
      totalMembers,
      totalTrainers,
      totalSessions,
      activeSubscriptions,
      monthlyRevenue,
      growth: '+12%' // Mock growth rate
    };
  }

  async updateMemberById(userId: string, updates: any) {
    const users = this.db.collection('users');
    const memberProfiles = this.db.collection('memberProfiles');

    // Update user info
    if (updates.firstName || updates.lastName || updates.email || updates.phone) {
      await users.updateOne(
        { _id: new ObjectId(userId) },
        {
          $set: {
            firstName: updates.firstName,
            lastName: updates.lastName,
            email: updates.email,
            phone: updates.phone,
            updatedAt: new Date()
          }
        }
      );
    }

    // Update member profile
    const profileUpdates: any = {};
    if (updates.membershipTierId) profileUpdates.membershipTierId = new ObjectId(updates.membershipTierId);
    if (updates.fitnessGoals) profileUpdates.fitnessGoals = updates.fitnessGoals;
    if (updates.emergencyContact) profileUpdates.emergencyContact = updates.emergencyContact;

    if (Object.keys(profileUpdates).length > 0) {
      profileUpdates.updatedAt = new Date();
      await memberProfiles.updateOne(
        { userId: new ObjectId(userId) },
        { $set: profileUpdates }
      );
    }

    return { success: true };
  }

  async updateTrainerById(userId: string, updates: any) {
    const users = this.db.collection('users');
    const trainerProfiles = this.db.collection('trainerProfiles');

    // Update user info
    if (updates.firstName || updates.lastName || updates.email || updates.phone) {
      await users.updateOne(
        { _id: new ObjectId(userId) },
        {
          $set: {
            firstName: updates.firstName,
            lastName: updates.lastName,
            email: updates.email,
            phone: updates.phone,
            updatedAt: new Date()
          }
        }
      );
    }

    // Update trainer profile
    const profileUpdates: any = {};
    if (updates.specializations) profileUpdates.specializations = updates.specializations;
    if (updates.hourlyRate) profileUpdates.hourlyRate = updates.hourlyRate;
    if (updates.experienceYears) profileUpdates.experienceYears = updates.experienceYears;
    if (updates.certifications) profileUpdates.certifications = updates.certifications;
    if (updates.bio) profileUpdates.bio = updates.bio;

    if (Object.keys(profileUpdates).length > 0) {
      profileUpdates.updatedAt = new Date();
      await trainerProfiles.updateOne(
        { userId: new ObjectId(userId) },
        { $set: profileUpdates }
      );
    }

    return { success: true };
  }

  async deleteUser(userId: string) {
    const users = this.db.collection('users');
    const memberProfiles = this.db.collection('memberProfiles');
    const trainerProfiles = this.db.collection('trainerProfiles');
    const subscriptions = this.db.collection('subscriptions');
    const trainingSessions = this.db.collection('trainingSessions');
    const workoutPlans = this.db.collection('workoutPlans');
    const nutritionPlans = this.db.collection('nutritionPlans');

    const objectId = new ObjectId(userId);

    // Delete related data
    await Promise.all([
      memberProfiles.deleteMany({ userId: objectId }),
      trainerProfiles.deleteMany({ userId: objectId }),
      subscriptions.deleteMany({ memberId: objectId }),
      trainingSessions.deleteMany({ $or: [{ memberId: objectId }, { trainerId: objectId }] }),
      workoutPlans.deleteMany({ $or: [{ memberId: objectId }, { trainerId: objectId }] }),
      nutritionPlans.deleteMany({ $or: [{ memberId: objectId }, { trainerId: objectId }] })
    ]);

    // Delete user
    await users.deleteOne({ _id: objectId });

    return { success: true };
  }

  // System Settings methods
  async getGymSettings() {
    const settings = this.db.collection('gymSettings');
    return await settings.findOne({});
  }

  async updateGymSettings(settingsData: any) {
    const settings = this.db.collection('gymSettings');
    return await settings.replaceOne(
      {},
      { ...settingsData, updatedAt: new Date() },
      { upsert: true }
    );
  }

  async updateMembershipTierPrice(tierId: string, monthlyPrice: string) {
    const tiers = this.db.collection('membershipTiers');
    return await tiers.updateOne(
      { _id: new ObjectId(tierId) },
      {
        $set: {
          monthlyPrice: monthlyPrice,
          updatedAt: new Date()
        }
      }
    );
  }

  // Attendance methods
  async recordAttendance(attendanceData: any) {
    const attendance = this.db.collection('attendance');
    const result = await attendance.insertOne({
      ...attendanceData,
      trainerId: new ObjectId(attendanceData.trainerId),
      date: attendanceData.date, // Store as string to match query expectations
      createdAt: new Date()
    });
    return await attendance.findOne({ _id: result.insertedId });
  }

  async getAttendanceByDate(date: string) {
    const attendance = this.db.collection('attendance');

    // Match by date string exactly
    const attendanceRecords = await attendance.aggregate([
      {
        $match: {
          date: date
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'trainerId',
          foreignField: '_id',
          as: 'trainer'
        }
      },
      {
        $unwind: {
          path: '$trainer',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          trainerId: 1,
          date: 1,
          status: 1,
          checkInTime: 1,
          checkOutTime: 1,
          notes: 1,
          trainerName: {
            $concat: ['$trainer.firstName', ' ', '$trainer.lastName']
          },
          createdAt: 1
        }
      }
    ]).toArray();

    return attendanceRecords;
  }

  async getAttendanceStats(trainerId?: string, month?: number, year: number = new Date().getFullYear()) {
    const attendance = this.db.collection('attendance');

    let matchQuery: any = {};

    if (trainerId) {
      matchQuery.trainerId = new ObjectId(trainerId);
    }

    if (month) {
      // Match records for specific month and year using date strings
      const monthStr = month.toString().padStart(2, '0');
      const yearStr = year.toString();
      matchQuery.date = {
        $regex: `^${yearStr}-${monthStr}`
      };
    } else {
      // Match records for the entire year
      const yearStr = year.toString();
      matchQuery.date = {
        $regex: `^${yearStr}`
      };
    }

    const stats = await attendance.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$trainerId',
          totalDays: { $sum: 1 },
          presentDays: {
            $sum: {
              $cond: [{ $eq: ['$status', 'present'] }, 1, 0]
            }
          },
          absentDays: {
            $sum: {
              $cond: [{ $eq: ['$status', 'absent'] }, 1, 0]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'trainer'
        }
      },
      {
        $unwind: '$trainer'
      },
      {
        $project: {
          trainerId: '$_id',
          trainerName: {
            $concat: ['$trainer.firstName', ' ', '$trainer.lastName']
          },
          totalDays: 1,
          presentDays: 1,
          absentDays: 1,
          attendanceRate: {
            $multiply: [
              { $divide: ['$presentDays', '$totalDays'] },
              100
            ]
          }
        }
      }
    ]).toArray();

    return stats;
  }

  async updateAttendance(attendanceId: string, updates: any) {
    const attendance = this.db.collection('attendance');
    return await attendance.updateOne(
      { _id: new ObjectId(attendanceId) },
      {
        $set: {
          ...updates,
          updatedAt: new Date()
        }
      }
    );
  }

  async deleteAttendance(attendanceId: string) {
    const attendance = this.db.collection('attendance');
    return await attendance.deleteOne({ _id: new ObjectId(attendanceId) });
  }

  // Body Assessment methods
  async createBodyAssessment(assessmentData: any) {
    const assessments = this.db.collection('bodyAssessments');
    const result = await assessments.insertOne({
      ...assessmentData,
      memberId: new ObjectId(assessmentData.memberId),
      createdAt: new Date()
    });
    return await assessments.findOne({ _id: result.insertedId });
  }

  async getBodyAssessmentsByMember(memberId: string) {
    const assessments = this.db.collection('bodyAssessments');
    return await assessments.find({ memberId: new ObjectId(memberId) }).sort({ createdAt: -1 }).toArray();
  }

  async getAllBodyAssessments() {
    const assessments = this.db.collection('bodyAssessments');
    return await assessments.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'memberId',
          foreignField: '_id',
          as: 'member'
        }
      },
      {
        $unwind: {
          path: '$member',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 1,
          memberId: 1,
          memberName: {
            $concat: ['$member.firstName', ' ', '$member.lastName']
          },
          dateOfBirth: 1,
          age: 1,
          height: 1,
          bloodPressure: 1,
          afterTreadmillBP: 1,
          emergencyContact: 1,
          bodyComposition: 1,
          posturalAssessment: 1,
          circumferenceMeasurements: 1,
          recommendations: 1,
          advice: 1,
          createdAt: 1
        }
      },
      { $sort: { createdAt: -1 } }
    ]).toArray();
  }

  async updateBodyAssessment(assessmentId: string, updates: any) {
    const assessments = this.db.collection('bodyAssessments');
    return await assessments.updateOne(
      { _id: new ObjectId(assessmentId) },
      {
        $set: {
          ...updates,
          updatedAt: new Date()
        }
      }
    );
  }

  async deleteBodyAssessment(assessmentId: string) {
    const assessments = this.db.collection('bodyAssessments');
    return await assessments.deleteOne({ _id: new ObjectId(assessmentId) });
  }

  async shareAssessmentWithTrainer(assessmentId: string, trainerId: string) {
    const sharedAssessments = this.db.collection('sharedAssessments');
    const result = await sharedAssessments.insertOne({
      assessmentId: new ObjectId(assessmentId),
      trainerId: new ObjectId(trainerId),
      sharedAt: new Date()
    });
    return result;
  }

  async getSharedAssessments(trainerId: string) {
    const sharedAssessments = this.db.collection('sharedAssessments');
    return await sharedAssessments.aggregate([
      {
        $match: { trainerId: new ObjectId(trainerId) }
      },
      {
        $lookup: {
          from: 'bodyAssessments',
          localField: 'assessmentId',
          foreignField: '_id',
          as: 'assessment'
        }
      },
      {
        $unwind: '$assessment'
      },
      {
        $lookup: {
          from: 'users',
          localField: 'assessment.memberId',
          foreignField: '_id',
          as: 'member'
        }
      },
      {
        $unwind: '$member'
      },
      {
        $project: {
          assessmentId: 1,
          sharedAt: 1,
          assessment: 1,
          memberName: {
            $concat: ['$member.firstName', ' ', '$member.lastName']
          }
        }
      }
    ]).toArray();
  }

  // Close database connection
  async close() {
    if (this.client) {
      await this.client.close();
    }
  }
}

export const mongoStorage = new MongoStorage();