import type { Express } from "express";
import { createServer, type Server } from "http";
import session from 'express-session';
import { storage } from "./storage.js";
import { initializeDatabase, pool } from "./db.js";
import { emailService } from "./emailService.js";

// Authentication middleware
const isAuthenticated = async (req: any, res: any, next: any) => {
  try {
    // Check session-based auth first
    if (req.session.user) {
      req.user = { claims: { sub: req.session.user.id } };
      return next();
    }

    // Allow some endpoints without auth
    if (req.path.startsWith('/api/admin') || req.path.startsWith('/api/test') || req.path.startsWith('/api/contact')) {
      return next();
    }

    // Check if user exists in database as fallback
    if (req.user?.claims?.sub) {
      const user = await storage.getUser(req.user.claims.sub);
      if (user) {
        return next();
      }
    }

    return res.status(401).json({ message: "Authentication required" });
  } catch (error) {
    console.error("Authentication middleware error:", error);
    return res.status(401).json({ message: "Authentication required" });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session middleware with secret
  app.use(session({
    secret: 'reshape-fitness-dev-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: false,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax'
    }
  }));

  // Auth routes for demo login/logout
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      let userData = null;

      // Check main user credentials
      if (email === "admin" && password === "admin") {
        // Get admin user from database
        try {
          const dbUser = await storage.getUserByEmail("admin@reshape.com");
          if (dbUser) {
            userData = {
              id: dbUser.id.toString(),
              email: dbUser.email,
              firstName: dbUser.firstName || dbUser.first_name || 'Admin',
              lastName: dbUser.lastName || dbUser.last_name || 'User',
              userType: dbUser.userType || dbUser.user_type || 'admin',
              role: dbUser.userType || dbUser.user_type || 'admin',
              first_name: dbUser.firstName || dbUser.first_name || 'Admin',
              last_name: dbUser.lastName || dbUser.last_name || 'User',
              user_type: dbUser.userType || dbUser.user_type || 'admin'
            };
          } else {
            return res.status(401).json({ message: "Admin user not found in database. Please check database initialization." });
          }
        } catch (dbError) {
          console.error("Database lookup error for admin:", dbError);
          return res.status(500).json({ message: "Database error during admin authentication." });
        }
      } else if (email === "trainer" && password === "trainer") {
        // Get trainer user from database
        try {
          const dbUser = await storage.getUserByEmail("trainer@reshape.com");
          if (dbUser) {
            userData = {
              id: dbUser.id.toString(),
              email: dbUser.email,
              firstName: dbUser.firstName || dbUser.first_name || 'Trainer',
              lastName: dbUser.lastName || dbUser.last_name || 'Pro',
              userType: dbUser.userType || dbUser.user_type || 'trainer',
              role: dbUser.userType || dbUser.user_type || 'trainer',
              first_name: dbUser.firstName || dbUser.first_name || 'Trainer',
              last_name: dbUser.lastName || dbUser.last_name || 'Pro',
              user_type: dbUser.userType || dbUser.user_type || 'trainer'
            };
          } else {
            return res.status(401).json({ message: "Trainer user not found in database. Please check database initialization." });
          }
        } catch (dbError) {
          console.error("Database lookup error for trainer:", dbError);
          return res.status(500).json({ message: "Database error during trainer authentication." });
        }
      } else if (email === "member" && password === "member") {
        // Get member user from database
        try {
          const dbUser = await storage.getUserByEmail("member@reshape.com");
          if (dbUser) {
            userData = {
              id: dbUser.id.toString(),
              email: dbUser.email,
              firstName: dbUser.firstName || dbUser.first_name || 'Member',
              lastName: dbUser.lastName || dbUser.last_name || 'Test',
              userType: dbUser.userType || dbUser.user_type || 'member',
              role: dbUser.userType || dbUser.user_type || 'member',
              first_name: dbUser.firstName || dbUser.first_name || 'Member',
              last_name: dbUser.lastName || dbUser.last_name || 'Test',
              user_type: dbUser.userType || dbUser.user_type || 'member'
            };
          } else {
            return res.status(401).json({ message: "Member user not found in database. Please check database initialization." });
          }
        } catch (dbError) {
          console.error("Database lookup error for member:", dbError);
          return res.status(500).json({ message: "Database error during member authentication." });
        }
      }

      if (!userData) {
        return res.status(401).json({ message: "Invalid credentials. Use: admin/admin, trainer/trainer, or member/member" });
      }

      // Store user in session
      req.session.user = userData;

      res.json({ 
        message: "Login successful",
        user: userData,
        success: true
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed", error: error.message });
    }
  });

  app.post('/api/auth/logout', async (req, res) => {
    try {
      // Destroy the session
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destroy error:", err);
          return res.status(500).json({ message: "Logout failed" });
        }

        // Clear the session cookie
        res.clearCookie('connect.sid');
        res.json({ message: "Logout successful" });
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Logout failed" });
    }
  });

  // Test PostgreSQL connection
  app.get('/api/test-postgres', async (req, res) => {
    try {
      const tiers = await storage.getMembershipTiers();
      res.json({ 
        message: "PostgreSQL connected successfully", 
        tiersCount: tiers.length,
        database: "Neon PostgreSQL",
        testCompleted: true 
      });
    } catch (error) {
      console.error("PostgreSQL test error:", error);
      res.status(500).json({ message: "PostgreSQL connection failed", error: error.message });
    }
  });

  // Contact form submission (store in PostgreSQL and send emails)
  app.post('/api/contact', async (req, res) => {
    try {
      const { firstName, lastName, email, phone, location, interest, message } = req.body;

      // Validate required fields
      if (!firstName || !lastName || !email || !phone || !location || !interest || !message) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Create inquiry details object
      const inquiryDetails = {
        firstName,
        lastName,
        email,
        phone,
        location,
        interest,
        message,
        submittedAt: new Date().toISOString()
      };

      // Save to database
      const contactUser = await storage.createUser({
        email: `contact_${Date.now()}_${email}`,
        firstName,
        lastName,
        userType: 'member',
        phone
      });

      console.log('Contact form submitted:', { firstName, lastName, email, location, interest });

      // Send confirmation email to customer
      try {
        await emailService.sendContactConfirmationEmail(email, firstName, inquiryDetails);
        console.log('Confirmation email sent to customer:', email);
      } catch (emailError) {
        console.error('Failed to send confirmation email to customer:', emailError);
        // Don't fail the request if email fails, just log it
      }

      // Send notification email to admin
      try {
        const adminEmail = 'admin@reshape.com'; // You can make this configurable
        await emailService.sendAdminContactNotification(adminEmail, inquiryDetails);
        console.log('Admin notification email sent');
      } catch (emailError) {
        console.error('Failed to send admin notification email:', emailError);
        // Don't fail the request if email fails, just log it
      }

      res.json({ 
        message: "Contact form submitted successfully and confirmation email sent",
        submissionId: contactUser.id
      });
    } catch (error) {
      console.error("Contact form submission error:", error);
      res.status(500).json({ message: "Failed to submit contact form", error: error.message });
    }
  });

  // Initialize membership tiers
  app.get('/api/init', async (req, res) => {
    try {
      // Don't reinitialize if already done
      res.json({ message: "Initialized successfully" });
    } catch (error) {
      console.error("Error initializing:", error);
      res.status(500).json({ message: "Failed to initialize" });
    }
  });

  // Auth routes
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // Check session first
      if (req.session.user) {
        const user = req.session.user;
        // Ensure consistent structure
        const userData = {
          id: user.id.toString(),
          email: user.email,
          firstName: user.firstName || user.first_name || '',
          lastName: user.lastName || user.last_name || '',
          userType: user.userType || user.user_type || user.role || 'member',
          role: user.role || user.userType || user.user_type || 'member',
          first_name: user.firstName || user.first_name || '',
          last_name: user.lastName || user.last_name || '',
          user_type: user.userType || user.user_type || user.role || 'member'
        };
        return res.json(userData);
      }

      // Fallback to database lookup for legacy users
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Get additional profile data based on user type
      let profileData = null;
      try {
        if (user?.userType === 'member') {
          profileData = await storage.getMemberProfile(userId);
        } else if (user?.userType === 'trainer') {
          profileData = await storage.getTrainerProfile(userId);
        }
      } catch (profileError) {
        console.error("Error fetching profile data:", profileError);
        // Continue without profile data
      }

      // Ensure consistent structure
      const userData = {
        id: user.id.toString(),
        email: user.email,
        firstName: user.firstName || user.first_name || '',
        lastName: user.lastName || user.last_name || '',
        userType: user.userType || user.user_type || user.role || 'member',
        role: user.role || user.userType || user.user_type || 'member',
        first_name: user.firstName || user.first_name || '',
        last_name: user.lastName || user.last_name || '',
        user_type: user.userType || user.user_type || user.role || 'member',
        profileData
      };

      res.json(userData);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  // Membership tiers
  app.get('/api/membership-tiers', async (req, res) => {
    try {
      const tiers = await storage.getMembershipTiers();
      res.json(tiers);
    } catch (error) {
      console.error("Error fetching membership tiers:", error);
      res.status(500).json({ message: "Failed to fetch membership tiers" });
    }
  });

  // Create member profile
  app.post('/api/member-profile', async (req: any, res) => {
    try {
      const userId = req.body.userId;
      const profileData = {
        ...req.body,
        userId
      };

      const profile = await storage.createMemberProfile(profileData);
      res.json(profile);
    } catch (error) {
      console.error("Error creating member profile:", error);
      res.status(500).json({ message: "Failed to create member profile" });
    }
  });

  // Create trainer profile
  app.post('/api/trainer-profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || '1';
      const profileData = {
        ...req.body,
        userId
      };

      const profile = await storage.createTrainerProfile(profileData);
      res.json(profile);
    } catch (error) {
      console.error("Error creating trainer profile:", error);
      res.status(500).json({ message: "Failed to create trainer profile" });
    }
  });

  // Get trainers
  app.get('/api/trainers', isAuthenticated, async (req, res) => {
    try {
      const trainers = await storage.getAllTrainers();
      res.json(trainers);
    } catch (error) {
      console.error("Error fetching trainers:", error);
      res.status(500).json({ message: "Failed to fetch trainers" });
    }
  });

  // Training sessions
  app.get('/api/training-sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || '1';
      const user = await storage.getUser(userId);

      let sessions = [];
      if (user?.userType === 'member') {
        const memberProfile = await storage.getMemberProfile(userId);
        if (memberProfile) {
          sessions = await storage.getTrainingSessions({ memberId: memberProfile.id });
        }
      } else if (user?.userType === 'trainer') {
        const trainerProfile = await storage.getTrainerProfile(userId);
        if (trainerProfile) {
          sessions = await storage.getTrainingSessions({ trainerId: trainerProfile.id });
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
      const session = await storage.createTrainingSession(req.body);
      res.json(session);
    } catch (error) {
      console.error("Error creating training session:", error);
      res.status(500).json({ message: "Failed to create training session" });
    }
  });

  // Workout plans
  app.get('/api/workout-plans', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || '1';
      const user = await storage.getUser(userId);

      let plans = [];
      if (user?.userType === 'member') {
        const memberProfile = await storage.getMemberProfile(userId);
        if (memberProfile) {
          plans = await storage.getWorkoutPlans({ memberId: memberProfile.id });
        }
      } else if (user?.userType === 'trainer') {
        const trainerProfile = await storage.getTrainerProfile(userId);
        if (trainerProfile) {
          plans = await storage.getWorkoutPlans({ trainerId: trainerProfile.id });
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
      const plan = await storage.createWorkoutPlan(req.body);
      res.json(plan);
    } catch (error) {
      console.error("Error creating workout plan:", error);
      res.status(500).json({ message: "Failed to create workout plan" });
    }
  });

  // Nutrition plans
  app.get('/api/nutrition-plans', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || '1';
      const user = await storage.getUser(userId);

      let plans = [];
      if (user?.userType === 'member') {
        const memberProfile = await storage.getMemberProfile(userId);
        if (memberProfile) {
          plans = await storage.getNutritionPlans({ memberId: memberProfile.id });
        }
      } else if (user?.userType === 'trainer') {
        const trainerProfile = await storage.getTrainerProfile(userId);
        if (trainerProfile) {
          plans = await storage.getNutritionPlans({ trainerId: trainerProfile.id });
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
      const plan = await storage.createNutritionPlan(req.body);
      res.json(plan);
    } catch (error) {
      console.error("Error creating nutrition plan:", error);
      res.status(500).json({ message: "Failed to create nutrition plan" });
    }
  });

  // Body assessments
  app.get('/api/body-assessments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || '1';
      const user = await storage.getUser(userId);

      let assessments = [];
      if (user?.userType === 'member') {
        const memberProfile = await storage.getMemberProfile(userId);
        if (memberProfile) {
          assessments = await storage.getBodyAssessments({ memberId: memberProfile.id });
        }
      } else if (user?.userType === 'trainer') {
        const trainerProfile = await storage.getTrainerProfile(userId);
        if (trainerProfile) {
          assessments = await storage.getBodyAssessments({ trainerId: trainerProfile.id });
        }
      }

      res.json(assessments);
    } catch (error) {
      console.error("Error fetching body assessments:", error);
      res.status(500).json({ message: "Failed to fetch body assessments" });
    }
  });

  // Create body assessment
  app.post('/api/body-assessments', isAuthenticated, async (req: any, res) => {
    try {
      const assessment = await storage.createBodyAssessment(req.body);
      res.json(assessment);
    } catch (error) {
      console.error("Error creating body assessment:", error);
      res.status(500).json({ message: "Failed to create body assessment" });
    }
  });

  // Get attendance by date
  app.get('/api/admin/attendance/:date', async (req, res) => {
    try {
      const { date } = req.params;
      const { rows } = await pool.query(`
        SELECT ta.*, u.first_name, u.last_name, u.email,
               CONCAT(u.first_name, ' ', u.last_name) as trainerName
        FROM trainer_attendance ta 
        JOIN users u ON ta.trainer_id = u.id 
        WHERE ta.date = $1 
        ORDER BY ta.check_in_time DESC NULLS LAST
      `, [date]);
      res.json(rows.map(row => ({
        ...row,
        _id: row.id,
        trainerId: row.trainer_id,
        trainerName: row.trainername,
        checkInTime: row.check_in_time,
        checkOutTime: row.check_out_time
      })));
    } catch (error: any) {
      console.error("Error fetching attendance:", error);
      if (error.message?.includes('relation "trainer_attendance" does not exist')) {
        res.json([]); // Return empty array if table doesn't exist
      } else {
        res.status(500).json({ message: "Failed to fetch attendance" });
      }
    }
  });

  // Get attendance stats
  app.get('/api/admin/attendance-stats', async (req, res) => {
    try {
      const { year } = req.query;
      const { rows } = await pool.query(`
        SELECT 
          EXTRACT(MONTH FROM date) as month,
          COUNT(*) as total_visits,
          COUNT(DISTINCT member_id) as unique_members
        FROM attendance 
        WHERE EXTRACT(YEAR FROM date) = $1 
        GROUP BY EXTRACT(MONTH FROM date) 
        ORDER BY month
      `, [year || new Date().getFullYear()]);
      res.json(rows);
    } catch (error) {
      console.error("Error fetching attendance stats:", error);
      res.status(500).json({ message: "Failed to fetch attendance stats" });
    }
  });

  // Trainer routes
  app.get('/api/trainer/stats', async (req, res) => {
    try {
      const trainerId = req.user?.id;
      if (!trainerId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Mock stats for now - implement with real database queries
      const stats = {
        totalClients: 12,
        todaySessions: 4,
        weeklyHours: 32,
        avgRating: 4.8
      };

      res.json(stats);
    } catch (error: any) {
      console.error('Error fetching trainer stats:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get('/api/trainer/sessions', async (req, res) => {
    try {
      const trainerId = req.user?.id;
      if (!trainerId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Mock sessions for now - implement with real database queries
      const sessions = [
        {
          id: 1,
          clientName: "Sarah Johnson",
          sessionType: "Strength Training",
          date: "2024-01-15",
          time: "09:00 AM",
          duration: 60,
          status: "Confirmed",
          notes: "Focus on upper body strength"
        }
      ];

      res.json(sessions);
    } catch (error: any) {
      console.error('Error fetching trainer sessions:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get('/api/trainer/clients', async (req, res) => {
    try {
      const trainerId = req.user?.id;
      if (!trainerId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Mock clients for now - implement with real database queries
      const clients = [
        { id: 1, name: "Sarah Johnson", email: "sarah@email.com", joinDate: "2024-01-01", sessionsCompleted: 24 }
      ];

      res.json(clients);
    } catch (error: any) {
      console.error('Error fetching trainer clients:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get('/api/trainer/workout-plans', async (req, res) => {
    try {
      const trainerId = req.user?.id;
      if (!trainerId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Mock workout plans for now - implement with real database queries
      const workoutPlans = [
        { id: 1, clientName: "Sarah Johnson", planName: "Upper Body Strength", createdDate: "2024-01-10", exercises: 8 }
      ];

      res.json(workoutPlans);
    } catch (error: any) {
      console.error('Error fetching workout plans:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get('/api/trainer/nutrition-plans', async (req, res) => {
    try {
      const trainerId = req.user?.id;
      if (!trainerId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Mock nutrition plans for now - implement with real database queries
      const nutritionPlans = [
        { id: 1, clientName: "Sarah Johnson", planName: "Muscle Gain Diet", createdDate: "2024-01-10", calories: 2200 }
      ];

      res.json(nutritionPlans);
    } catch (error: any) {
      console.error('Error fetching nutrition plans:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get('/api/trainer/assessments', async (req, res) => {
    try {
      const trainerId = req.user?.id;
      if (!trainerId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Mock assessments for now - implement with real database queries
      const assessments = [
        { id: 1, clientName: "Keval Patel", date: "2024-01-14", trainerName: "Coach Alex" }
      ];

      res.json(assessments);
    } catch (error: any) {
      console.error('Error fetching assessments:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get('/api/trainer/inquiries', async (req, res) => {
    try {
      const trainerId = req.user?.id;
      if (!trainerId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Fetch inquiries from database
      const inquiries = await storage.getContactSubmissions();
      res.json(inquiries || []);
    } catch (error: any) {
      console.error('Error fetching inquiries:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Member session routes
  app.post('/api/admin/member-sessions', async (req, res) => {
    try {
      const { memberId, trainerId, sessionType, scheduledDate, scheduledTime, duration, notes, memberName, trainerName } = req.body;

      if (!memberId || !trainerId || !sessionType || !scheduledDate) {
        return res.status(400).json({ message: "Missing required fields: memberId, trainerId, sessionType, scheduledDate" });
      }

      // Validate time format if provided
      const timePattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (scheduledTime && scheduledTime.trim() !== '' && !timePattern.test(scheduledTime)) {
        return res.status(400).json({ message: "Invalid time format. Use HH:MM format." });
      }

      const session = await storage.createMemberSession({
        memberId,
        trainerId,
        sessionType,
        scheduledDate,
        scheduledTime,
        duration: duration || 60,
        notes,
        memberName,
        trainerName
      });

      res.json({ 
        message: "Session scheduled successfully",
        session
      });
    } catch (error: any) {
      console.error("Error creating member session:", error);
      res.status(500).json({ message: error.message || "Failed to create session" });
    }
  });

  app.get('/api/admin/member-sessions', async (req, res) => {
    try {
      const { memberId, trainerId, date } = req.query;
      const sessions = await storage.getMemberSessions({ memberId, trainerId, date });
      res.json(sessions);
    } catch (error: any) {
      console.error("Error fetching member sessions:", error);
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  });

  app.put('/api/admin/member-sessions/:sessionId', async (req, res) => {
    try {
      const { sessionId } = req.params;
      const updates = req.body;

      // Validate time format if provided
      const timePattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (updates.scheduledTime && updates.scheduledTime.trim() !== '' && !timePattern.test(updates.scheduledTime)) {
        return res.status(400).json({ message: "Invalid time format. Use HH:MM format." });
      }

      await storage.updateMemberSession(sessionId, updates);
      res.json({ message: "Session updated successfully" });
    } catch (error: any) {
      console.error("Error updating member session:", error);
      res.status(500).json({ message: error.message || "Failed to update session" });
    }
  });

  app.delete('/api/admin/member-sessions/:sessionId', async (req, res) => {
    try {
      const { sessionId } = req.params;
      await storage.deleteMemberSession(sessionId);
      res.json({ message: "Session deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting member session:", error);
      res.status(500).json({ message: error.message || "Failed to delete session" });
    }
  });

  // Member routes
  app.get('/api/member/stats', async (req, res) => {
    try {
      const memberId = req.user?.id;
      if (!memberId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Mock stats for now - implement with real database queries
      const stats = {
        workoutsThisMonth: 18,
        caloriesBurned: 2400,
        avgWorkoutTime: 65,
        fitnessScore: 78
      };

      res.json(stats);
    } catch (error: any) {
      console.error('Error fetching member stats:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get('/api/member/sessions', async (req, res) => {
    try {
      const memberId = req.user?.id;
      if (!memberId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Mock sessions for now - implement with real database queries
      const sessions = [
        { id: 1, trainer: "Alex Johnson", date: "Today", time: "10:00 AM", type: "Strength Training", status: "Confirmed" }
      ];

      res.json(sessions);
    } catch (error: any) {
      console.error('Error fetching member sessions:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get('/api/member/workouts', async (req, res) => {
    try {
      const memberId = req.user?.id;
      if (!memberId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Mock workouts for now - implement with real database queries
      const workouts = [
        { id: 1, type: "Strength Training", duration: "60 min", calories: 320, date: "Jan 15", trainer: "Alex Johnson" }
      ];

      res.json(workouts);
    } catch (error: any) {
      console.error('Error fetching member workouts:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get('/api/member/goals', async (req, res) => {
    try {
      const memberId = req.user?.id;
      if (!memberId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Mock goals for now - implement with real database queries
      const goals = [
        { goal: "Lose 5 lbs", progress: 60, target: "Feb 28" }
      ];

      res.json(goals);
    } catch (error: any) {
      console.error('Error fetching member goals:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin routes
  app.get('/api/admin/members', async (req, res) => {
    try {
      // Exclude demo users from management lists
      const members = await storage.getAllMembers({ excludeDemo: true });
      res.json(members);
    } catch (error) {
      console.error("Error fetching members:", error);
      res.status(500).json({ message: "Failed to fetch members" });
    }
  });

  // Body assessments routes
  app.get('/api/admin/body-assessments', async (req, res) => {
    try {
      const assessments = await storage.getBodyAssessments({});
      res.json(assessments);
    } catch (error) {
      console.error("Error fetching body assessments:", error);
      res.status(500).json({ message: "Failed to fetch body assessments" });
    }
  });

  app.post('/api/admin/body-assessments', async (req, res) => {
    try {
      const assessment = await storage.createBodyAssessment(req.body);
      res.json(assessment);
    } catch (error) {
      console.error("Error creating body assessment:", error);
      res.status(500).json({ message: "Failed to create body assessment" });
    }
  });

  app.post('/api/admin/body-assessments/:assessmentId/share/:trainerId', async (req, res) => {
    try {
      // Mock sharing functionality
      res.json({ message: "Assessment shared successfully" });
    } catch (error) {
      console.error("Error sharing assessment:", error);
      res.status(500).json({ message: "Failed to share assessment" });
    }
  });

  // Inquiries routes
  app.get('/api/admin/inquiries', async (req, res) => {
    try {
      const inquiries = await storage.getContactSubmissions();
      res.json(inquiries || []);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      res.status(500).json({ message: "Failed to fetch inquiries" });
    }
  });

  app.post('/api/admin/inquiries/:inquiryId/convert', async (req, res) => {
    try {
      const { inquiryId } = req.params;
      const { memberData, assessmentData } = req.body;

      // Mock conversion functionality
      res.json({ message: "Inquiry converted successfully" });
    } catch (error) {
      console.error("Error converting inquiry:", error);
      res.status(500).json({ message: "Failed to convert inquiry" });
    }
  });

  app.delete('/api/admin/inquiries/:inquiryId', async (req, res) => {
    try {
      const { inquiryId } = req.params;
      // Mock deletion functionality
      res.json({ message: "Inquiry deleted successfully" });
    } catch (error) {
      console.error("Error deleting inquiry:", error);
      res.status(500).json({ message: "Failed to delete inquiry" });
    }
  });

  // Attendance routes
  app.post('/api/admin/attendance', async (req, res) => {
    try {
      const { trainerId, status, date, checkInTime, checkOutTime, notes } = req.body;

      if (!trainerId || !status || !date) {
        return res.status(400).json({ message: "Missing required fields: trainerId, status, date" });
      }

      // Validate time format if provided
      const timePattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      
      if (checkInTime && checkInTime.trim() !== '' && !timePattern.test(checkInTime)) {
        return res.status(400).json({ message: "Invalid check-in time format. Use HH:MM format." });
      }
      
      if (checkOutTime && checkOutTime.trim() !== '' && !timePattern.test(checkOutTime)) {
        return res.status(400).json({ message: "Invalid check-out time format. Use HH:MM format." });
      }

      const attendance = await storage.recordTrainerAttendance({
        trainerId,
        date,
        status,
        checkInTime: checkInTime || null,
        checkOutTime: checkOutTime || null,
        notes: notes || null
      });

      res.json({ 
        message: "Attendance recorded successfully",
        attendance
      });
    } catch (error: any) {
      console.error("Error recording attendance:", error);
      res.status(500).json({ message: error.message || "Failed to record attendance" });
    }
  });

  app.get('/api/admin/trainers', async (req, res) => {
    try {
      // Exclude demo users from management lists
      const trainers = await storage.getAllTrainers({ excludeDemo: true });
      res.json(trainers);
    } catch (error) {
      console.error("Error fetching trainers:", error);
      res.status(500).json({ message: "Failed to fetch trainers" });
    }
  });

  app.get('/api/admin/stats', async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  app.post('/api/admin/create-member', async (req, res) => {
    try {
      const { firstName, lastName, email, membershipTierId, phone, emergencyContact, fitnessGoals } = req.body;

      console.log('Creating member with data:', req.body);

      if (!firstName || !lastName || !email) {
        return res.status(400).json({ message: "Missing required fields: firstName, lastName, email" });
      }

      // Check if email already exists in member_profiles
      const { rows: existingMembers } = await pool.query('SELECT * FROM member_profiles WHERE email = $1', [email]);
      if (existingMembers.length > 0) {
        return res.status(400).json({ message: "Member with this email already exists" });
      }

      // Create member profile directly (no user creation)
      const memberProfile = await storage.createMemberProfile({
        firstName,
        lastName,
        email,
        phone: phone || null,
        membershipTierId: membershipTierId || null,
        emergencyContact: emergencyContact || email,
        fitnessGoals: fitnessGoals || "General fitness improvement"
      });

      console.log('Created member profile:', memberProfile);

      res.json({ 
        message: "Member created successfully",
        profile: memberProfile 
      });
    } catch (error: any) {
      console.error("Error creating member:", error);
      res.status(500).json({ message: error.message || "Failed to create member" });
    }
  });

  app.post('/api/admin/create-trainer', async (req, res) => {
    try {
      const { firstName, lastName, email, phone, specializations, hourlyRate, experienceYears, certifications, bio } = req.body;

      if (!firstName || !lastName || !email) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Check if email already exists in trainer_profiles
      const { rows: existingTrainers } = await pool.query('SELECT * FROM trainer_profiles WHERE email = $1', [email]);
      if (existingTrainers.length > 0) {
        return res.status(400).json({ message: "Trainer with this email already exists" });
      }

      // Create trainer profile directly (no user creation)
      const trainerProfile = await storage.createTrainerProfile({
        firstName,
        lastName,
        email,
        phone: phone || null,
        specializations: specializations || [],
        hourlyRate: hourlyRate || 75.00,
        experienceYears: experienceYears || 2,
        certifications: certifications || "",
        bio: bio || "",
        isAvailable: true
      });

      res.json({ profile: trainerProfile });
    } catch (error: any) {
      console.error("Error creating trainer:", error);
      res.status(500).json({ message: error.message || "Failed to create trainer" });
    }
  });

  app.delete('/api/admin/delete-member/:userId', async (req, res) => {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({ message: "Profile ID is required" });
      }

      console.log(`Attempting to delete member profile with ID: ${userId}`);

      // Delete from member_profiles table
      const { rows } = await pool.query('DELETE FROM member_profiles WHERE id = $1 RETURNING *', [userId]);

      if (rows.length === 0) {
        return res.status(404).json({ message: "Member profile not found" });
      }

      console.log(`Successfully deleted member profile with ID: ${userId}`);
      res.json({ message: "Member deleted successfully", success: true });
    } catch (error: any) {
      console.error("Error deleting member:", error);
      res.status(500).json({ message: error.message || "Failed to delete member" });
    }
  });

  app.delete('/api/admin/delete-trainer/:userId', async (req, res) => {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({ message: "Profile ID is required" });
      }

      console.log(`Attempting to delete trainer profile with ID: ${userId}`);

      // Delete from trainer_profiles table
      const { rows } = await pool.query('DELETE FROM trainer_profiles WHERE id = $1 RETURNING *', [userId]);

      if (rows.length === 0) {
        return res.status(404).json({ message: "Trainer profile not found" });
      }

      console.log(`Successfully deleted trainer profile with ID: ${userId}`);
      res.json({ message: "Trainer deleted successfully", success: true });
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
        return res.status(400).json({ message: "Profile ID is required" });
      }

      // Update member profile directly
      const fields = [];
      const values = [];
      let paramIndex = 1;

      if (updates.firstName) {
        fields.push(`first_name = $${paramIndex++}`);
        values.push(updates.firstName);
      }
      if (updates.lastName) {
        fields.push(`last_name = $${paramIndex++}`);
        values.push(updates.lastName);
      }
      if (updates.email) {
        fields.push(`email = $${paramIndex++}`);
        values.push(updates.email);
      }
      if (updates.phone) {
        fields.push(`phone = $${paramIndex++}`);
        values.push(updates.phone);
      }
      if (updates.membershipTierId) {
        fields.push(`membership_tier_id = $${paramIndex++}`);
        values.push(updates.membershipTierId);
      }
      if (updates.fitnessGoals) {
        fields.push(`fitness_goals = $${paramIndex++}`);
        values.push(updates.fitnessGoals);
      }
      if (updates.emergencyContact) {
        fields.push(`emergency_contact = $${paramIndex++}`);
        values.push(updates.emergencyContact);
      }

      if (fields.length > 0) {
        fields.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(userId);
        await pool.query(
          `UPDATE member_profiles SET ${fields.join(', ')} WHERE id = $${paramIndex}`,
          values
        );
      }

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
        return res.status(400).json({ message: "Profile ID is required" });
      }

      // Update trainer profile directly
      const fields = [];
      const values = [];
      let paramIndex = 1;

      if (updates.firstName) {
        fields.push(`first_name = $${paramIndex++}`);
        values.push(updates.firstName);
      }
      if (updates.lastName) {
        fields.push(`last_name = $${paramIndex++}`);
        values.push(updates.lastName);
      }
      if (updates.email) {
        fields.push(`email = $${paramIndex++}`);
        values.push(updates.email);
      }
      if (updates.phone) {
        fields.push(`phone = $${paramIndex++}`);
        values.push(updates.phone);
      }
      if (updates.specializations) {
        fields.push(`specializations = $${paramIndex++}`);
        values.push(updates.specializations);
      }
      if (updates.hourlyRate) {
        fields.push(`hourly_rate = $${paramIndex++}`);
        values.push(updates.hourlyRate);
      }
      if (updates.experienceYears) {
        fields.push(`experience_years = $${paramIndex++}`);
        values.push(updates.experienceYears);
      }
      if (updates.certifications) {
        fields.push(`certifications = $${paramIndex++}`);
        values.push(updates.certifications);
      }
      if (updates.bio !== undefined) {
        fields.push(`bio = $${paramIndex++}`);
        values.push(updates.bio);
      }
      if (updates.isAvailable !== undefined) {
        fields.push(`is_available = $${paramIndex++}`);
        values.push(updates.isAvailable);
      }

      if (fields.length > 0) {
        fields.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(userId);
        await pool.query(
          `UPDATE trainer_profiles SET ${fields.join(', ')} WHERE id = $${paramIndex}`,
          values
        );
      }

      res.json({ message: "Trainer updated successfully" });
    } catch (error: any) {
      console.error("Error updating trainer:", error);
      res.status(500).json({ message: error.message || "Failed to update trainer" });
    }
  });

  // Static membership subscription endpoint
  app.post('/api/create-membership', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || '1';
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ error: { message: "User not found" } });
      }

      const { membershipTierId } = req.body;
      if (!membershipTierId) {
        return res.status(400).json({ error: { message: 'Membership tier ID is required' } });
      }

      const membershipTier = await storage.getMembershipTier(membershipTierId);
      if (!membershipTier) {
        return res.status(400).json({ error: { message: 'Invalid membership tier' } });
      }

      let memberProfile = await storage.getMemberProfile(userId);
      if (!memberProfile) {
        memberProfile = await storage.createMemberProfile({
          userId,
          membershipTierId,
          fitnessGoals: "Transform my fitness journey",
          emergencyContact: user.email || "",
        });
      }

      const subscription = await storage.createSubscription({
        memberId: memberProfile.id,
        membershipTierId,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
        autoRenew: true,
      });

      res.json({
        success: true,
        message: "Membership activated successfully!",
        subscriptionId: subscription.id,
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