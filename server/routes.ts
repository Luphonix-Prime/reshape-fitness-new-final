import type { Express } from "express";
import { createServer, type Server } from "http";
import session from 'express-session';
import { mongoStorage } from "./mongoStorage.js";
// Remove auth temporarily for MongoDB setup  
// import { setupAuth, isAuthenticated } from "./replitAuth";

// Temporary mock for isAuthenticated during MongoDB setup
const isAuthenticated = (req: any, res: any, next: any) => {
  // Skip auth for now during development
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session middleware with secret
  app.use(session({
    secret: 'reshape-fitness-dev-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
  }));
  
  // Temporarily disable auth for MongoDB setup

  // Test MongoDB connection
  app.get('/api/test-mongo', async (req, res) => {
    try {
      const tiers = await mongoStorage.getMembershipTiers();
      res.json({ 
        message: "External MongoDB connected successfully to gymdata database", 
        tiersCount: tiers.length,
        database: "gymdata",
        host: "localhost:27017",
        testCompleted: true 
      });
    } catch (error) {
      console.error("MongoDB test error:", error);
      res.status(500).json({ message: "MongoDB connection failed", error: error.message });
    }
  });

  // Test email endpoint
  app.get('/api/test-email', async (req, res) => {
    try {
      const { emailService } = await import('./emailService.js');
      
      // Test email configuration
      const testEmail = process.env.GMAIL_USER || process.env.SMTP_USER;
      if (!testEmail) {
        return res.status(400).json({ 
          message: "No email configured in secrets. Please add GMAIL_USER and GMAIL_APP_PASSWORD to secrets." 
        });
      }

      // Send test email to yourself
      await emailService.sendContactConfirmationEmail(
        testEmail,
        'Test User',
        {
          interest: 'Testing email functionality',
          location: 'Test Location',
          message: 'This is a test email to verify SMTP configuration is working correctly.'
        }
      );

      res.json({ 
        message: "Test email sent successfully!",
        sentTo: testEmail
      });
    } catch (error) {
      console.error("Test email error:", error);
      res.status(500).json({ 
        message: "Failed to send test email", 
        error: error.message,
        troubleshooting: "Make sure you've added GMAIL_USER and GMAIL_APP_PASSWORD to your secrets"
      });
    }
  });

  app.post('/api/test-email', async (req, res) => {
    try {
      const { emailService } = await import('./emailService.js');
      
      // Test email configuration
      const testEmail = process.env.GMAIL_USER || process.env.SMTP_USER;
      if (!testEmail) {
        return res.status(400).json({ 
          message: "No email configured in secrets. Please add GMAIL_USER and GMAIL_APP_PASSWORD to secrets." 
        });
      }

      // Send test email to yourself
      await emailService.sendContactConfirmationEmail(
        testEmail,
        'Test User',
        {
          interest: 'Testing email functionality',
          location: 'Test Location',
          message: 'This is a test email to verify SMTP configuration is working correctly.'
        }
      );

      res.json({ 
        message: "Test email sent successfully!",
        sentTo: testEmail
      });
    } catch (error) {
      console.error("Test email error:", error);
      res.status(500).json({ 
        message: "Failed to send test email", 
        error: error.message,
        troubleshooting: "Make sure you've added GMAIL_USER and GMAIL_APP_PASSWORD to your secrets"
      });
    }
  });

  // Contact form submission
  app.post('/api/contact', async (req, res) => {
    try {
      const { firstName, lastName, email, phone, location, interest, message } = req.body;
      
      // Validate required fields
      if (!firstName || !lastName || !email || !phone || !location || !interest || !message) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Store contact submission in database
      const contactSubmission = {
        firstName,
        lastName,
        email,
        phone,
        location,
        interest,
        message,
        submittedAt: new Date().toISOString(),
        status: 'new'
      };

      const result = await mongoStorage.storeContactSubmission(contactSubmission);
      
      console.log('Contact form submitted:', { firstName, lastName, email, location, interest });

      // Send emails (async - don't wait for them to avoid blocking the response)
      try {
        const { emailService } = await import('./emailService.js');
        
        // Send confirmation email to customer
        await emailService.sendContactConfirmationEmail(
          email,
          `${firstName} ${lastName}`,
          {
            interest,
            location,
            message
          }
        );

        // Send notification email to admin
        const adminEmail = process.env.ADMIN_EMAIL || 'luphonix.prime@gmail.com';
        await emailService.sendAdminContactNotification(
          adminEmail,
          contactSubmission
        );

        console.log('Contact form emails sent successfully');
      } catch (emailError) {
        console.error('Failed to send contact form emails:', emailError);
        // Don't throw error - form submission should still succeed even if emails fail
      }
      
      res.json({ 
        message: "Contact form submitted successfully",
        submissionId: result.insertedId
      });
    } catch (error) {
      console.error("Contact form submission error:", error);
      res.status(500).json({ message: "Failed to submit contact form", error: error.message });
    }
  });

  // Initialize membership tiers
  app.get('/api/init', async (req, res) => {
    try {
      const existingTiers = await mongoStorage.getMembershipTiers();
      if (existingTiers.length === 0) {
        const tiers = [
          {
            name: "Access",
            monthlyPrice: "200.00",
            annualPrice: "2000.00",
            benefits: ["Full gym access", "Group fitness classes", "Locker room amenities", "Basic wellness services"],
            maxGuests: 0,
            personalTrainingIncluded: 0,
          },
          {
            name: "All Access",
            monthlyPrice: "300.00",
            annualPrice: "3000.00",
            benefits: ["Multiple location access", "Personal training sessions", "Spa services included", "Nutrition consultations", "Guest privileges"],
            maxGuests: 2,
            personalTrainingIncluded: 2,
          },
          {
            name: "Executive",
            monthlyPrice: "500.00",
            annualPrice: "5000.00",
            benefits: ["VIP lounge access", "Unlimited personal training", "Concierge services", "Exclusive events", "Priority booking"],
            maxGuests: 5,
            personalTrainingIncluded: 999,
          }
        ];

        for (const tier of tiers) {
          await mongoStorage.createMembershipTier(tier);
        }
      }
      
      res.json({ message: "Initialized successfully" });
    } catch (error) {
      console.error("Error initializing:", error);
      res.status(500).json({ message: "Failed to initialize" });
    }
  });

  // Reinitialize sample data
  app.get('/api/init-sample-data', async (req, res) => {
    try {
      const { initializeCollections } = require('./mongodb.js');
      await initializeCollections();
      res.json({ message: "Sample data reinitialized successfully" });
    } catch (error) {
      console.error("Error reinitializing sample data:", error);
      res.status(500).json({ message: "Failed to reinitialize sample data" });
    }
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || '507f1f77bcf86cd799439011'; // Mock user ID for testing
      const user = await mongoStorage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get additional profile data based on user type
      let profileData = null;
      if (user?.userType === 'member') {
        profileData = await mongoStorage.getMemberProfile(userId);
      } else if (user?.userType === 'trainer') {
        profileData = await mongoStorage.getTrainerProfile(userId);
      }

      res.json({ ...user, profileData });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Membership tiers
  app.get('/api/membership-tiers', async (req, res) => {
    try {
      const tiers = await mongoStorage.getMembershipTiers();
      res.json(tiers);
    } catch (error) {
      console.error("Error fetching membership tiers:", error);
      res.status(500).json({ message: "Failed to fetch membership tiers" });
    }
  });

  // Create member profile (auth disabled for MongoDB setup)
  app.post('/api/member-profile', async (req: any, res) => {
    try {
      const userId = req.body.userId; // Temporarily get from body
      const profileData = {
        ...req.body,
        userId
      };

      const profile = await mongoStorage.createMemberProfile(profileData);
      res.json(profile);
    } catch (error) {
      console.error("Error creating member profile:", error);
      res.status(500).json({ message: "Failed to create member profile" });
    }
  });

  // Create trainer profile
  app.post('/api/trainer-profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || '507f1f77bcf86cd799439011';
      const profileData = {
        ...req.body,
        userId
      };

      const profile = await mongoStorage.createTrainerProfile(profileData);
      res.json(profile);
    } catch (error) {
      console.error("Error creating trainer profile:", error);
      res.status(500).json({ message: "Failed to create trainer profile" });
    }
  });

  // Get trainers
  app.get('/api/trainers', isAuthenticated, async (req, res) => {
    try {
      const trainers = await mongoStorage.getAllTrainers();
      res.json(trainers);
    } catch (error) {
      console.error("Error fetching trainers:", error);
      res.status(500).json({ message: "Failed to fetch trainers" });
    }
  });

  // Training sessions
  app.get('/api/training-sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || '507f1f77bcf86cd799439011';
      const user = await mongoStorage.getUser(userId);
      
      let sessions = [];
      if (user?.userType === 'member') {
        const memberProfile = await mongoStorage.getMemberProfile(userId);
        if (memberProfile) {
          sessions = await mongoStorage.getTrainingSessionsByMember(memberProfile._id.toString());
        }
      } else if (user?.userType === 'trainer') {
        const trainerProfile = await mongoStorage.getTrainerProfile(userId);
        if (trainerProfile) {
          sessions = await mongoStorage.getTrainingSessionsByTrainer(trainerProfile._id.toString());
        }
      }

      res.json(sessions);
    } catch (error) {
      console.error("Error fetching training sessions:", error);
      res.status(500).json({ message: "Failed to fetch training sessions" });
    }
  });

  // Create training session
  app.post('/api/training-sessions', isAuthenticated, async (req: any, res) => {
    try {
      const session = await mongoStorage.createTrainingSession(req.body);
      res.json(session);
    } catch (error) {
      console.error("Error creating training session:", error);
      res.status(500).json({ message: "Failed to create training session" });
    }
  });

  // Workout plans
  app.get('/api/workout-plans', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || '507f1f77bcf86cd799439011';
      const user = await mongoStorage.getUser(userId);
      
      let plans = [];
      if (user?.userType === 'member') {
        const memberProfile = await mongoStorage.getMemberProfile(userId);
        if (memberProfile) {
          plans = await mongoStorage.getWorkoutPlansByMember(memberProfile._id.toString());
        }
      } else if (user?.userType === 'trainer') {
        const trainerProfile = await mongoStorage.getTrainerProfile(userId);
        if (trainerProfile) {
          plans = await mongoStorage.getWorkoutPlansByTrainer(trainerProfile._id.toString());
        }
      }

      res.json(plans);
    } catch (error) {
      console.error("Error fetching workout plans:", error);
      res.status(500).json({ message: "Failed to fetch workout plans" });
    }
  });

  // Create workout plan
  app.post('/api/workout-plans', isAuthenticated, async (req: any, res) => {
    try {
      const plan = await mongoStorage.createWorkoutPlan(req.body);
      res.json(plan);
    } catch (error) {
      console.error("Error creating workout plan:", error);
      res.status(500).json({ message: "Failed to create workout plan" });
    }
  });

  // Nutrition plans
  app.get('/api/nutrition-plans', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || '507f1f77bcf86cd799439011';
      const user = await mongoStorage.getUser(userId);
      
      let plans = [];
      if (user?.userType === 'member') {
        const memberProfile = await mongoStorage.getMemberProfile(userId);
        if (memberProfile) {
          plans = await mongoStorage.getNutritionPlansByMember(memberProfile._id.toString());
        }
      } else if (user?.userType === 'trainer') {
        const trainerProfile = await mongoStorage.getTrainerProfile(userId);
        if (trainerProfile) {
          plans = await mongoStorage.getNutritionPlansByTrainer(trainerProfile._id.toString());
        }
      }

      res.json(plans);
    } catch (error) {
      console.error("Error fetching nutrition plans:", error);
      res.status(500).json({ message: "Failed to fetch nutrition plans" });
    }
  });

  // Create nutrition plan
  app.post('/api/nutrition-plans', isAuthenticated, async (req: any, res) => {
    try {
      const plan = await mongoStorage.createNutritionPlan(req.body);
      res.json(plan);
    } catch (error) {
      console.error("Error creating nutrition plan:", error);
      res.status(500).json({ message: "Failed to create nutrition plan" });
    }
  });

  // Admin routes
  app.get('/api/admin/members', async (req, res) => {
    try {
      const members = await mongoStorage.getAllMembers();
      res.json(members);
    } catch (error) {
      console.error("Error fetching members:", error);
      res.status(500).json({ message: "Failed to fetch members" });
    }
  });

  app.get('/api/admin/trainers', async (req, res) => {
    try {
      const trainers = await mongoStorage.getAllTrainers();
      res.json(trainers);
    } catch (error) {
      console.error("Error fetching trainers:", error);
      res.status(500).json({ message: "Failed to fetch trainers" });
    }
  });

  app.get('/api/admin/stats', async (req, res) => {
    try {
      const stats = await mongoStorage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  app.post('/api/admin/create-member', async (req, res) => {
    try {
      const { firstName, lastName, email, membershipTierId, phone, emergencyContact, fitnessGoals } = req.body;
      
      if (!firstName || !lastName || !email || !membershipTierId) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const newUser = await mongoStorage.createUser({
        email,
        firstName,
        lastName,
        userType: 'member',
        phone: phone || null
      });

      const memberProfile = await mongoStorage.createMemberProfile({
        userId: newUser._id.toString(),
        membershipTierId,
        emergencyContact: emergencyContact || email,
        fitnessGoals: fitnessGoals || "General fitness improvement"
      });

      res.json({ user: newUser, profile: memberProfile });
    } catch (error: any) {
      console.error("Error creating member:", error);
      res.status(500).json({ message: error.message || "Failed to create member" });
    }
  });

  app.post('/api/admin/create-trainer', async (req, res) => {
    try {
      const { firstName, lastName, email, specializations, hourlyRate, experienceYears, certifications, bio } = req.body;
      
      if (!firstName || !lastName || !email) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const newUser = await mongoStorage.createUser({
        email,
        firstName,
        lastName,
        userType: 'trainer'
      });

      const trainerProfile = await mongoStorage.createTrainerProfile({
        userId: newUser._id.toString(),
        specializations: specializations || [],
        hourlyRate: hourlyRate || "75.00",
        experienceYears: experienceYears || 2,
        certifications: certifications || "",
        bio: bio || "",
        isAvailable: true
      });

      res.json({ user: newUser, profile: trainerProfile });
    } catch (error: any) {
      console.error("Error creating trainer:", error);
      res.status(500).json({ message: error.message || "Failed to create trainer" });
    }
  });

  app.delete('/api/admin/delete-member/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      await mongoStorage.deleteUser(userId);
      res.json({ message: "Member deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting member:", error);
      res.status(500).json({ message: error.message || "Failed to delete member" });
    }
  });

  app.delete('/api/admin/delete-trainer/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      await mongoStorage.deleteUser(userId);
      res.json({ message: "Trainer deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting trainer:", error);
      res.status(500).json({ message: error.message || "Failed to delete trainer" });
    }
  });

  app.put('/api/admin/update-member/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const updates = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      await mongoStorage.updateMemberById(userId, updates);
      res.json({ message: "Member updated successfully" });
    } catch (error: any) {
      console.error("Error updating member:", error);
      res.status(500).json({ message: error.message || "Failed to update member" });
    }
  });

  app.put('/api/admin/update-trainer/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const updates = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      await mongoStorage.updateTrainerById(userId, updates);
      res.json({ message: "Trainer updated successfully" });
    } catch (error: any) {
      console.error("Error updating trainer:", error);
      res.status(500).json({ message: error.message || "Failed to update trainer" });
    }
  });

  // System settings endpoints
  app.get('/api/admin/gym-settings', async (req, res) => {
    try {
      const settings = await mongoStorage.getGymSettings();
      res.json(settings || {
        gymName: "RESHAPE FITNESS",
        address: "123 Fitness Avenue, Luxury District",
        operatingHours: "5:00 AM - 11:00 PM"
      });
    } catch (error: any) {
      console.error("Error fetching gym settings:", error);
      res.status(500).json({ message: error.message || "Failed to fetch gym settings" });
    }
  });

  app.put('/api/admin/gym-settings', async (req, res) => {
    try {
      const settings = req.body;
      await mongoStorage.updateGymSettings(settings);
      res.json({ message: "Gym settings updated successfully" });
    } catch (error: any) {
      console.error("Error updating gym settings:", error);
      res.status(500).json({ message: error.message || "Failed to update gym settings" });
    }
  });

  app.put('/api/admin/membership-pricing', async (req, res) => {
    try {
      const { pricing } = req.body;
      
      if (!pricing || !Array.isArray(pricing)) {
        return res.status(400).json({ message: "Invalid pricing data" });
      }

      for (const item of pricing) {
        if (item.tierId && item.monthlyPrice) {
          await mongoStorage.updateMembershipTierPrice(item.tierId, item.monthlyPrice);
        }
      }

      res.json({ message: "Membership pricing updated successfully" });
    } catch (error: any) {
      console.error("Error updating membership pricing:", error);
      res.status(500).json({ message: error.message || "Failed to update membership pricing" });
    }
  });

  // Attendance endpoints
  app.post('/api/admin/attendance', async (req, res) => {
    try {
      const { trainerId, date, status, checkInTime, checkOutTime, notes } = req.body;
      
      if (!trainerId || !date || !status) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const attendanceData = {
        trainerId,
        date,
        status,
        checkInTime: checkInTime || null,
        checkOutTime: checkOutTime || null,
        notes: notes || ""
      };

      const attendance = await mongoStorage.recordAttendance(attendanceData);
      res.json(attendance);
    } catch (error: any) {
      console.error("Error recording attendance:", error);
      res.status(500).json({ message: error.message || "Failed to record attendance" });
    }
  });

  app.get('/api/admin/attendance/:date', async (req, res) => {
    try {
      const { date } = req.params;
      const attendance = await mongoStorage.getAttendanceByDate(date);
      res.json(attendance);
    } catch (error: any) {
      console.error("Error fetching attendance:", error);
      res.status(500).json({ message: error.message || "Failed to fetch attendance" });
    }
  });

  app.get('/api/admin/attendance-stats', async (req, res) => {
    try {
      const { trainerId, month, year } = req.query;
      const stats = await mongoStorage.getAttendanceStats(
        trainerId as string,
        month ? parseInt(month as string) : undefined,
        year ? parseInt(year as string) : new Date().getFullYear()
      );
      res.json(stats);
    } catch (error: any) {
      console.error("Error fetching attendance stats:", error);
      res.status(500).json({ message: error.message || "Failed to fetch attendance stats" });
    }
  });

  app.put('/api/admin/attendance/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      await mongoStorage.updateAttendance(id, updates);
      res.json({ message: "Attendance updated successfully" });
    } catch (error: any) {
      console.error("Error updating attendance:", error);
      res.status(500).json({ message: error.message || "Failed to update attendance" });
    }
  });

  app.put('/api/admin/attendance/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      await mongoStorage.updateAttendance(id, updates);
      res.json({ message: "Attendance updated successfully" });
    } catch (error: any) {
      console.error("Error updating attendance:", error);
      res.status(500).json({ message: error.message || "Failed to update attendance" });
    }
  });

  app.delete('/api/admin/attendance/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      await mongoStorage.deleteAttendance(id);
      res.json({ message: "Attendance deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting attendance:", error);
      res.status(500).json({ message: error.message || "Failed to delete attendance" });
    }
  });

  // Body Assessment routes
  app.post('/api/admin/body-assessments', async (req, res) => {
    try {
      const assessmentData = req.body;
      
      if (!assessmentData.memberId) {
        return res.status(400).json({ message: "Member ID is required" });
      }

      const assessment = await mongoStorage.createBodyAssessment(assessmentData);
      res.json(assessment);
    } catch (error: any) {
      console.error("Error creating body assessment:", error);
      res.status(500).json({ message: error.message || "Failed to create body assessment" });
    }
  });

  app.get('/api/admin/body-assessments', async (req, res) => {
    try {
      const assessments = await mongoStorage.getAllBodyAssessments();
      res.json(assessments);
    } catch (error: any) {
      console.error("Error fetching body assessments:", error);
      res.status(500).json({ message: error.message || "Failed to fetch body assessments" });
    }
  });

  app.get('/api/admin/body-assessments/member/:memberId', async (req, res) => {
    try {
      const { memberId } = req.params;
      const assessments = await mongoStorage.getBodyAssessmentsByMember(memberId);
      res.json(assessments);
    } catch (error: any) {
      console.error("Error fetching member assessments:", error);
      res.status(500).json({ message: error.message || "Failed to fetch member assessments" });
    }
  });

  app.put('/api/admin/body-assessments/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      await mongoStorage.updateBodyAssessment(id, updates);
      res.json({ message: "Body assessment updated successfully" });
    } catch (error: any) {
      console.error("Error updating body assessment:", error);
      res.status(500).json({ message: error.message || "Failed to update body assessment" });
    }
  });

  app.delete('/api/admin/body-assessments/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      await mongoStorage.deleteBodyAssessment(id);
      res.json({ message: "Body assessment deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting body assessment:", error);
      res.status(500).json({ message: error.message || "Failed to delete body assessment" });
    }
  });

  app.post('/api/admin/body-assessments/:id/share/:trainerId', async (req, res) => {
    try {
      const { id, trainerId } = req.params;
      
      await mongoStorage.shareAssessmentWithTrainer(id, trainerId);
      res.json({ message: "Assessment shared with trainer successfully" });
    } catch (error: any) {
      console.error("Error sharing assessment:", error);
      res.status(500).json({ message: error.message || "Failed to share assessment" });
    }
  });

  app.get('/api/trainer/shared-assessments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || '507f1f77bcf86cd799439011';
      const trainerProfile = await mongoStorage.getTrainerProfile(userId);
      
      if (!trainerProfile) {
        return res.status(404).json({ message: "Trainer profile not found" });
      }

      const sharedAssessments = await mongoStorage.getSharedAssessments(trainerProfile._id.toString());
      res.json(sharedAssessments);
    } catch (error: any) {
      console.error("Error fetching shared assessments:", error);
      res.status(500).json({ message: error.message || "Failed to fetch shared assessments" });
    }
  });

  // Inquiry management routes
  app.get('/api/admin/inquiries', async (req, res) => {
    try {
      const inquiries = await mongoStorage.getAllInquiries();
      res.json(inquiries);
    } catch (error: any) {
      console.error("Error fetching inquiries:", error);
      res.status(500).json({ message: error.message || "Failed to fetch inquiries" });
    }
  });

  app.get('/api/trainer/inquiries', isAuthenticated, async (req, res) => {
    try {
      const inquiries = await mongoStorage.getAllInquiries();
      res.json(inquiries);
    } catch (error: any) {
      console.error("Error fetching inquiries:", error);
      res.status(500).json({ message: error.message || "Failed to fetch inquiries" });
    }
  });

  app.post('/api/admin/inquiries/:id/convert', async (req, res) => {
    try {
      const { id } = req.params;
      const { memberData, assessmentData } = req.body;
      
      const result = await mongoStorage.convertInquiryToMember(id, memberData, assessmentData);
      res.json({ message: "Inquiry converted to member successfully", result });
    } catch (error: any) {
      console.error("Error converting inquiry:", error);
      res.status(500).json({ message: error.message || "Failed to convert inquiry" });
    }
  });

  app.post('/api/trainer/inquiries/:id/convert', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { memberData, assessmentData } = req.body;
      
      const result = await mongoStorage.convertInquiryToMember(id, memberData, assessmentData);
      res.json({ message: "Inquiry converted to member successfully", result });
    } catch (error: any) {
      console.error("Error converting inquiry:", error);
      res.status(500).json({ message: error.message || "Failed to convert inquiry" });
    }
  });

  app.delete('/api/admin/inquiries/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      await mongoStorage.deleteInquiry(id);
      res.json({ message: "Inquiry cancelled successfully" });
    } catch (error: any) {
      console.error("Error cancelling inquiry:", error);
      res.status(500).json({ message: error.message || "Failed to cancel inquiry" });
    }
  });

  app.delete('/api/trainer/inquiries/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      
      await mongoStorage.deleteInquiry(id);
      res.json({ message: "Inquiry cancelled successfully" });
    } catch (error: any) {
      console.error("Error cancelling inquiry:", error);
      res.status(500).json({ message: error.message || "Failed to cancel inquiry" });
    }
  });

  // Check and notify expiring memberships
  app.post('/api/admin/check-expiring-memberships', async (req, res) => {
    try {
      const result = await mongoStorage.checkAndNotifyExpiringMemberships();
      res.json({ 
        message: "Expiring memberships check completed",
        processed: result.processed
      });
    } catch (error: any) {
      console.error("Error checking expiring memberships:", error);
      res.status(500).json({ message: error.message || "Failed to check expiring memberships" });
    }
  });

  // Static membership subscription endpoint
  app.post('/api/create-membership', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || '507f1f77bcf86cd799439011';
      const user = await mongoStorage.getUser(userId);

      if (!user) {
        return res.status(404).json({ error: { message: "User not found" } });
      }

      const { membershipTierId } = req.body;
      if (!membershipTierId) {
        return res.status(400).json({ error: { message: 'Membership tier ID is required' } });
      }

      const membershipTier = await mongoStorage.getMembershipTier(membershipTierId);
      if (!membershipTier) {
        return res.status(400).json({ error: { message: 'Invalid membership tier' } });
      }

      let memberProfile = await mongoStorage.getMemberProfile(userId);
      if (!memberProfile) {
        memberProfile = await mongoStorage.createMemberProfile({
          userId,
          membershipTierId,
          fitnessGoals: "Transform my fitness journey",
          emergencyContact: user.email || "",
        });
      }

      const subscriptionId = `sub_${Date.now()}`;

      const subscription = await mongoStorage.createSubscription({
        id: subscriptionId,
        memberId: memberProfile._id.toString(),
        membershipTierId,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
        autoRenew: true,
      });

      res.json({
        success: true,
        message: "Membership activated successfully!",
        subscriptionId,
        membershipTier: membershipTier.name,
      });
    } catch (error: any) {
      console.error("Membership creation error:", error);
      return res.status(400).json({ error: { message: error.message } });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
