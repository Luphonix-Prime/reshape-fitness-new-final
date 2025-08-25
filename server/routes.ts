import type { Express } from "express";
import { createServer, type Server } from "http";
import session from 'express-session';
import { storage } from "./storage.js";
import { initializeDatabase, pool } from "./db.js";
import { emailService } from "./emailService.js";
import { authService } from "./authService.js";

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

  // Password reset routes
  app.post('/api/auth/forgot-password', async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const result = await authService.createPasswordResetToken(email);

      if (result.success) {
        res.json({ message: result.message });
      } else {
        res.status(400).json({ message: result.message });
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Failed to process password reset request" });
    }
  });

  app.get('/api/auth/verify-reset-token/:token', async (req, res) => {
    try {
      const { token } = req.params;
      const result = await authService.verifyPasswordResetToken(token);

      if (result.valid) {
        res.json({ valid: true, message: result.message });
      } else {
        res.status(400).json({ valid: false, message: result.message });
      }
    } catch (error) {
      console.error("Token verification error:", error);
      res.status(500).json({ valid: false, message: "Failed to verify token" });
    }
  });

  app.post('/api/auth/reset-password', async (req, res) => {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({ message: "Token and new password are required" });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
      }

      const result = await authService.resetPassword(token, newPassword);

      if (result.success) {
        res.json({ message: result.message });
      } else {
        res.status(400).json({ message: result.message });
      }
    } catch (error) {
      console.error("Password reset error:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  // Email change routes
  app.post('/api/auth/change-email', isAuthenticated, async (req: any, res) => {
    try {
      const { newEmail } = req.body;
      const userId = req.session.user?.id;

      if (!newEmail) {
        return res.status(400).json({ message: "New email is required" });
      }

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const result = await authService.createEmailChangeToken(userId, newEmail);

      if (result.success) {
        res.json({ message: result.message });
      } else {
        res.status(400).json({ message: result.message });
      }
    } catch (error) {
      console.error("Email change error:", error);
      res.status(500).json({ message: "Failed to process email change request" });
    }
  });

  app.get('/api/auth/confirm-email-change/:token', async (req, res) => {
    try {
      const { token } = req.params;
      const result = await authService.confirmEmailChange(token);

      if (result.success) {
        res.json({ message: result.message });
      } else {
        res.status(400).json({ message: result.message });
      }
    } catch (error) {
      console.error("Email change confirmation error:", error);
      res.status(500).json({ message: "Failed to confirm email change" });
    }
  });

  // Change password (authenticated users)
  app.post('/api/auth/change-password', isAuthenticated, async (req: any, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.session.user?.id;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required" });
      }

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ message: "New password must be at least 8 characters long" });
      }

      // Get user's current password hash
      const { rows: userRows } = await pool.query('SELECT password_hash FROM users WHERE id = $1', [userId]);

      if (userRows.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      const user = userRows[0];

      // For demo users without passwords, allow any current password
      if (!user.password_hash) {
        const hashedPassword = await authService.hashPassword(newPassword);
        await pool.query('UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [hashedPassword, userId]);
        return res.json({ message: "Password set successfully" });
      }

      // Verify current password
      const isCurrentPasswordValid = await authService.verifyPassword(currentPassword, user.password_hash);

      if (!isCurrentPasswordValid) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      // Hash and update new password
      const hashedPassword = await authService.hashPassword(newPassword);
      await pool.query('UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [hashedPassword, userId]);

      res.json({ message: "Password changed successfully" });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  // Debug endpoint to show database contents
  app.get('/api/debug/database-contents', async (req, res) => {
    try {
      // Get all tables data
      const sessions = await pool.query('SELECT * FROM member_sessions ORDER BY created_at DESC LIMIT 10');
      const assessments = await pool.query('SELECT * FROM body_assessments ORDER BY created_at DESC LIMIT 10');
      const members = await pool.query('SELECT * FROM member_profiles ORDER BY created_at DESC LIMIT 10');
      const trainers = await pool.query('SELECT * FROM trainer_profiles ORDER BY created_at DESC LIMIT 10');
      const assignments = await pool.query('SELECT * FROM member_trainer_assignments ORDER BY created_at DESC LIMIT 10');
      const workoutPlans = await pool.query('SELECT * FROM workout_plans ORDER BY created_at DESC LIMIT 10');
      const nutritionPlans = await pool.query('SELECT * FROM nutrition_plans ORDER BY created_at DESC LIMIT 10');

      res.json({
        sessions: sessions.rows,
        assessments: assessments.rows,
        members: members.rows,
        trainers: trainers.rows,
        assignments: assignments.rows,
        workoutPlans: workoutPlans.rows,
        nutritionPlans: nutritionPlans.rows,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Debug database contents error:', error);
      res.status(500).json({ message: "Failed to fetch database contents", error: error.message });
    }
  });

  // Auth routes for demo login/logout
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      let userData = null;

      // First check for demo credentials
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
      } else {
        // Check real user credentials in database
        try {
          const { rows: userRows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

          if (userRows.length === 0) {
            return res.status(401).json({ message: "Invalid credentials" });
          }

          const dbUser = userRows[0];

          // Check if user has a password set
          if (!dbUser.password_hash) {
            return res.status(401).json({ message: "Password not set for this account. Please contact administrator." });
          }

          // Verify password
          const isPasswordValid = await authService.verifyPassword(password, dbUser.password_hash);

          if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
          }

          // User authenticated successfully
          userData = {
            id: dbUser.id.toString(),
            email: dbUser.email,
            firstName: dbUser.first_name || '',
            lastName: dbUser.last_name || '',
            userType: dbUser.user_type || 'member',
            role: dbUser.user_type || 'member',
            first_name: dbUser.first_name || '',
            last_name: dbUser.last_name || '',
            user_type: dbUser.user_type || 'member'
          };

          console.log(`User authenticated: ${email} (${dbUser.user_type})`);
        } catch (dbError) {
          console.error("Database error during authentication:", dbError);
          return res.status(500).json({ message: "Authentication error" });
        }
      }

      if (!userData) {
        return res.status(401).json({ message: "Invalid credentials" });
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

      // Save to inquiries table
      const inquiry = await storage.createInquiry({
        firstName,
        lastName,
        email,
        phone,
        location,
        interest,
        message
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
        submissionId: inquiry.id
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
      console.log('Fetching membership tiers...');
      const tiers = await storage.getMembershipTiers();
      console.log('Membership tiers fetched:', tiers.length);
      res.json(tiers);
    } catch (error) {
      console.error("Error fetching membership tiers:", error);
      res.status(500).json({ message: "Failed to fetch membership tiers", error: error.message });
    }
  });

  // Admin membership tier management
  app.post('/api/admin/membership-tiers', async (req, res) => {
    try {
      const tierData = req.body;

      // Validate required fields
      if (!tierData.name || !tierData.sessions || !tierData.duration) {
        return res.status(400).json({ message: "Name, sessions, and duration are required" });
      }

      const tier = await storage.createMembershipTier(tierData);
      res.json({
        message: "Membership tier created successfully",
        tier
      });
    } catch (error: any) {
      console.error("Error creating membership tier:", error);
      res.status(500).json({ message: error.message || "Failed to create membership tier" });
    }
  });

  app.put('/api/admin/membership-tiers/:tierId', async (req, res) => {
    try {
      const { tierId } = req.params;
      const updates = req.body;

      await storage.updateMembershipTier(tierId, updates);
      res.json({ message: "Membership tier updated successfully" });
    } catch (error: any) {
      console.error("Error updating membership tier:", error);
      res.status(500).json({ message: error.message || "Failed to update membership tier" });
    }
  });

  app.delete('/api/admin/membership-tiers/:tierId', async (req, res) => {
    try {
      const { tierId } = req.params;

      await storage.deleteMembershipTier(tierId);
      res.json({ message: "Membership tier deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting membership tier:", error);
      res.status(500).json({ message: error.message || "Failed to delete membership tier" });
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

  // Get all trainers for admin
  app.get('/api/admin/trainers', async (req, res) => {
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

  // Update workout plan
  app.put('/api/workout-plans/:planId', isAuthenticated, async (req: any, res) => {
    try {
      const { planId } = req.params;
      const updates = req.body;

      await storage.updateWorkoutPlan(planId, updates);
      res.json({ message: "Workout plan updated successfully" });
    } catch (error: any) {
      console.error("Error updating workout plan:", error);
      res.status(500).json({ message: error.message || "Failed to update workout plan" });
    }
  });

  // Delete workout plan
  app.delete('/api/workout-plans/:planId', isAuthenticated, async (req: any, res) => {
    try {
      const { planId } = req.params;

      await storage.deleteWorkoutPlan(planId);
      res.json({ message: "Workout plan deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting workout plan:", error);
      res.status(500).json({ message: error.message || "Failed to delete workout plan" });
    }
  });

  // Create workout plan
  app.post('/api/workout-plans', isAuthenticated, async (req: any, res) => {
    try {
      const { memberId, trainerId, planName, description, duration, exercises } = req.body;

      if (!memberId || !trainerId || !planName) {
        return res.status(400).json({ message: "Missing required fields: memberId, trainerId, planName" });
      }

      const plan = await storage.createWorkoutPlan({
        memberId,
        trainerId,
        planName,
        description: description || '',
        duration: duration || 4,
        exercises: exercises || ''
      });

      res.json({
        message: "Workout plan created successfully",
        plan
      });
    } catch (error: any) {
      console.error("Error creating workout plan:", error);
      res.status(500).json({ message: error.message || "Failed to create workout plan" });
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

  // Update nutrition plan
  app.put('/api/nutrition-plans/:planId', isAuthenticated, async (req: any, res) => {
    try {
      const { planId } = req.params;
      const updates = req.body;

      await storage.updateNutritionPlan(planId, updates);
      res.json({ message: "Nutrition plan updated successfully" });
    } catch (error: any) {
      console.error("Error updating nutrition plan:", error);
      res.status(500).json({ message: error.message || "Failed to update nutrition plan" });
    }
  });

  // Delete nutrition plan
  app.delete('/api/nutrition-plans/:planId', isAuthenticated, async (req: any, res) => {
    try {
      const { planId } = req.params;

      await storage.deleteNutritionPlan(planId);
      res.json({ message: "Nutrition plan deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting nutrition plan:", error);
      res.status(500).json({ message: error.message || "Failed to delete nutrition plan" });
    }
  });

  // Create nutrition plan
  app.post('/api/nutrition-plans', isAuthenticated, async (req: any, res) => {
    try {
      const { memberId, trainerId, planName, description, calories, meals } = req.body;

      if (!memberId || !trainerId || !planName) {
        return res.status(400).json({ message: "Missing required fields: memberId, trainerId, planName" });
      }

      const plan = await storage.createNutritionPlan({
        memberId,
        trainerId,
        planName,
        description: description || '',
        calories: calories || 2000,
        meals: meals || ''
      });

      res.json({
        message: "Nutrition plan created successfully",
        plan
      });
    } catch (error: any) {
      console.error("Error creating nutrition plan:", error);
      res.status(500).json({ message: error.message || "Failed to create nutrition plan" });
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
  app.get('/api/trainer/stats', async (req: any, res) => {
    try {
      const userEmail = req.session.user?.email;
      if (!userEmail) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      console.log(`Fetching stats for trainer user: ${userEmail}`);

      // For trainer dashboard, show overall stats (all assignments and sessions)
      const { rows: clientStats } = await pool.query(`
        SELECT COUNT(DISTINCT mta.member_id) as total_clients
        FROM member_trainer_assignments mta
        WHERE mta.is_active = true
      `);

      const { rows: sessionStats } = await pool.query(`
        SELECT COUNT(*) as today_sessions
        FROM member_sessions ms
        WHERE DATE(ms.scheduled_date) = CURRENT_DATE
      `);

      const { rows: weeklyStats } = await pool.query(`
        SELECT COALESCE(SUM(ms.duration), 0) as weekly_minutes
        FROM member_sessions ms
        WHERE ms.scheduled_date >= CURRENT_DATE - INTERVAL '7 days'
        AND ms.scheduled_date <= CURRENT_DATE
      `);

      const stats = {
        totalClients: parseInt(clientStats[0]?.total_clients) || 0,
        todaySessions: parseInt(sessionStats[0]?.today_sessions) || 0,
        weeklyHours: Math.round((parseInt(weeklyStats[0]?.weekly_minutes) || 0) / 60),
        avgRating: 4.8 // This would need a ratings system implementation
      };

      console.log(`Trainer stats:`, stats);
      res.json(stats);
    } catch (error: any) {
      console.error('Error fetching trainer stats:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get('/api/trainer/sessions', async (req: any, res) => {
    try {
      const userEmail = req.session.user?.email;
      const userId = req.session.user?.id;

      if (!userEmail || !userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      console.log(`Fetching sessions for trainer user: ${userEmail}`);

      // Get all upcoming sessions from database with trainer and member details
      // For trainer dashboard, show all sessions (they can see all scheduled sessions)
      const { rows } = await pool.query(`
        SELECT ms.*,
               COALESCE(ms.member_name, CONCAT(mp.first_name, ' ', mp.last_name)) as client_name,
               COALESCE(ms.trainer_name, CONCAT(tp.first_name, ' ', tp.last_name)) as trainer_name,
               ms.session_type,
               ms.scheduled_date::date as date,
               ms.scheduled_time as time,
               ms.duration,
               CASE
                 WHEN ms.status IS NULL THEN 'Pending'
                 ELSE INITCAP(ms.status)
               END as status,
               ms.notes,
               ms.created_at
        FROM member_sessions ms
        LEFT JOIN member_profiles mp ON ms.member_id = mp.id
        LEFT JOIN trainer_profiles tp ON ms.trainer_id = tp.id
        WHERE ms.scheduled_date >= CURRENT_DATE
        ORDER BY ms.created_at DESC, ms.scheduled_date, ms.scheduled_time
        LIMIT 50
      `);

      console.log(`Found ${rows.length} sessions in database`);

      const sessions = rows.map(row => ({
        id: row.id,
        clientName: row.client_name || 'Unknown Client',
        trainerName: row.trainer_name || 'Unknown Trainer',
        sessionType: row.session_type || 'Training Session',
        date: new Date(row.date).toISOString().split('T')[0],
        time: row.time || 'TBD',
        duration: row.duration || 60,
        status: row.status || 'Pending',
        notes: row.notes || '',
        createdAt: row.created_at
      }));

      res.json(sessions);
    } catch (error: any) {
      console.error('Error fetching trainer sessions:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get('/api/trainer/clients', async (req: any, res) => {
    try {
      const userEmail = req.session.user?.email;
      if (!userEmail) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Get trainer profile by email
      const { rows: trainerRows } = await pool.query('SELECT id FROM trainer_profiles WHERE email = $1', [userEmail]);
      if (trainerRows.length === 0) {
        return res.json([]);
      }
      const trainerId = trainerRows[0].id;

      // Get assigned clients from database
      const { rows } = await pool.query(`
        SELECT mp.id,
               CONCAT(mp.first_name, ' ', mp.last_name) as name,
               mp.email,
               mp.created_at as join_date,
               COUNT(ms.id) as sessions_completed
        FROM member_profiles mp
        JOIN member_trainer_assignments mta ON mp.id = mta.member_id
        LEFT JOIN member_sessions ms ON mp.id = ms.member_id AND ms.trainer_id = $1
        WHERE mta.trainer_id = $1 AND mta.is_active = true
        GROUP BY mp.id, mp.first_name, mp.last_name, mp.email, mp.created_at
        ORDER BY mp.first_name, mp.last_name
      `, [trainerId]);

      const clients = rows.map(row => ({
        id: row.id,
        name: row.name,
        email: row.email,
        joinDate: row.join_date,
        sessionsCompleted: parseInt(row.sessions_completed) || 0
      }));

      res.json(clients);
    } catch (error: any) {
      console.error('Error fetching trainer clients:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get('/api/trainer/workout-plans', async (req: any, res) => {
    try {
      const userEmail = req.session.user?.email;
      if (!userEmail) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Get trainer profile by email
      const { rows: trainerRows } = await pool.query('SELECT id FROM trainer_profiles WHERE email = $1', [userEmail]);
      if (trainerRows.length === 0) {
        return res.json([]);
      }
      const trainerId = trainerRows[0].id;

      // Get workout plans created by this trainer
      const { rows } = await pool.query(`
        SELECT wp.*,
               CONCAT(mp.first_name, ' ', mp.last_name) as client_name
        FROM workout_plans wp
        LEFT JOIN member_profiles mp ON wp.member_id = mp.id
        WHERE wp.trainer_id = $1
        ORDER BY wp.created_at DESC
      `, [trainerId]);

      const workoutPlans = rows.map(row => ({
        id: row.id,
        clientName: row.client_name || 'Unknown Client',
        planName: row.plan_name,
        description: row.description,
        duration: row.duration,
        exercises: row.exercises,
        createdDate: row.created_at,
        exerciseCount: row.exercises ? row.exercises.split(',').length : 0
      }));

      res.json(workoutPlans);
    } catch (error: any) {
      console.error('Error fetching workout plans:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get('/api/trainer/nutrition-plans', async (req: any, res) => {
    try {
      const userEmail = req.session.user?.email;
      if (!userEmail) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Get trainer profile by email
      const { rows: trainerRows } = await pool.query('SELECT id FROM trainer_profiles WHERE email = $1', [userEmail]);
      if (trainerRows.length === 0) {
        return res.json([]);
      }
      const trainerId = trainerRows[0].id;

      // Get nutrition plans created by this trainer
      const { rows } = await pool.query(`
        SELECT np.*,
               CONCAT(mp.first_name, ' ', mp.last_name) as client_name
        FROM nutrition_plans np
        LEFT JOIN member_profiles mp ON np.member_id = mp.id
        WHERE np.trainer_id = $1
        ORDER BY np.created_at DESC
      `, [trainerId]);

      const nutritionPlans = rows.map(row => ({
        id: row.id,
        clientName: row.client_name || 'Unknown Client',
        planName: row.plan_name,
        description: row.description,
        calories: row.calories || 2000,
        meals: row.meals,
        createdDate: row.created_at
      }));

      res.json(nutritionPlans);
    } catch (error: any) {
      console.error('Error fetching nutrition plans:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get('/api/trainer/assessments', async (req: any, res) => {
    try {
      const userEmail = req.session.user?.email;
      const userName = `${req.session.user?.firstName || 'Trainer'} ${req.session.user?.lastName || 'Pro'}`;
      const userId = req.session.user?.id;

      if (!userEmail || !userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      console.log(`Fetching assessments for trainer: ${userName} (${userEmail}) with user ID: ${userId}`);

      // Get all body assessments from the database
      const { rows } = await pool.query(`
        SELECT ba.*,
               COALESCE(ba.client_name, CONCAT(mp.first_name, ' ', mp.last_name)) as client_name,
               '${userName}' as trainer_name
        FROM body_assessments ba
        LEFT JOIN member_profiles mp ON ba.member_id = mp.id
        ORDER BY ba.created_at DESC
      `);

      console.log(`Found ${rows.length} assessments in database`);

      const assessments = rows.map(row => ({
        id: row.id,
        clientName: row.client_name,
        date: new Date(row.created_at).toISOString().split('T')[0],
        trainerName: row.trainer_name,
        age: row.age,
        height: row.height,
        weight: row.weight,
        bmi: row.bmi,
        advice: row.advice
      }));

      res.json(assessments);
    } catch (error: any) {
      console.error('Error fetching assessments:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get('/api/trainer/inquiries', async (req: any, res) => {
    try {
      const userId = req.session.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Trainers can see inquiries but not manage them like admins
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

      // Validate and convert time format if provided
      const validateAndConvertTime = (timeStr: string): string | null => {
        if (!timeStr || timeStr.trim() === '') return null;

        // Handle 24-hour format (HH:MM)
        const time24Pattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (time24Pattern.test(timeStr)) {
          return timeStr;
        }

        // Handle 12-hour format (HH:MM AM/PM)
        const time12Pattern = /^([0-1]?[0-9]):[0-5][0-9]\s?(AM|PM)$/i;
        const match = timeStr.match(time12Pattern);
        if (match) {
          let [, hour, ampm] = match;
          let hourNum = parseInt(hour);

          if (ampm.toLowerCase() === 'pm' && hourNum !== 12) {
            hourNum += 12;
          } else if (ampm.toLowerCase() === 'am' && hourNum === 12) {
            hourNum = 0;
          }

          return `${hourNum.toString().padStart(2, '0')}:${timeStr.split(':')[1].split(' ')[0]}`;
        }

        return null;
      };

      let convertedScheduledTime = scheduledTime;
      if (scheduledTime && scheduledTime.trim() !== '') {
        const converted = validateAndConvertTime(scheduledTime);
        if (converted === null) {
          return res.status(400).json({ message: "Invalid time format. Use HH:MM or HH:MM AM/PM format." });
        }
        convertedScheduledTime = converted;
      }

      const sessionData = {
        memberId,
        trainerId,
        memberName: memberName,
        trainerName: trainerName,
        sessionType,
        scheduledDate,
        scheduledTime: convertedScheduledTime,
        duration: duration || 60,
        notes,
        status: 'scheduled'
      };

      console.log('Creating session with data:', sessionData);

      const session = await storage.createMemberSession(sessionData);

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

      // Validate and convert time format if provided
      const validateAndConvertTime = (timeStr: string): string | null => {
        if (!timeStr || timeStr.trim() === '') return null;

        // Handle 24-hour format (HH:MM)
        const time24Pattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (time24Pattern.test(timeStr)) {
          return timeStr;
        }

        // Handle 12-hour format (HH:MM AM/PM)
        const time12Pattern = /^([0-1]?[0-9]):[0-5][0-9]\s?(AM|PM)$/i;
        const match = time12Pattern.match(time12Pattern);
        if (match) {
          let [, hour, ampm] = match;
          let hourNum = parseInt(hour);

          if (ampm.toLowerCase() === 'pm' && hourNum !== 12) {
            hourNum += 12;
          } else if (ampm.toLowerCase() === 'am' && hourNum === 12) {
            hourNum = 0;
          }

          return `${hourNum.toString().padStart(2, '0')}:${timeStr.split(':')[1].split(' ')[0]}`;
        }

        return null;
      };

      if (updates.scheduledTime && updates.scheduledTime.trim() !== '') {
        const convertedTime = validateAndConvertTime(updates.scheduledTime);
        if (convertedTime === null) {
          return res.status(400).json({ message: "Invalid time format. Use HH:MM or HH:MM AM/PM format." });
        }
        updates.scheduledTime = convertedTime;
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

  // Admin route to view all sessions
  app.get('/api/admin/all-sessions', async (req, res) => {
    try {
      const sessions = await storage.getMemberSessions({});
      res.json(sessions);
    } catch (error: any) {
      console.error("Error fetching all sessions:", error);
      res.status(500).json({ message: error.message || "Failed to fetch sessions" });
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
  // Get all members
  app.get('/api/admin/members', async (req, res) => {
    try {
      const { rows } = await pool.query(`
        SELECT
          mp.id,
          mp.first_name,
          mp.last_name,
          mp.email,
          mp.phone,
          mp.fitness_goals,
          mp.emergency_contact,
          mp.created_at,
          mp.updated_at,
          u.first_name as user_first_name,
          u.last_name as user_last_name,
          u.email as user_email,
          mt.name as membership_tier_name,
          mt.sessions as membership_sessions,
          mt.duration as membership_duration,
          mt.one_on_one_price,
          mt.two_people_price,
          mt.three_people_price,
          COALESCE(sub.training_type, mp.training_type, 'one_on_one') as training_type,
          sub.plan_type,
          sub.training_type as subscription_training_type,
          sub.membership_tier_id as subscription_membership_tier_id,
          sub.sessions_total,
          sub.sessions_used,
          sub.price_paid,
          sub.start_date as subscription_start_date,
          sub.end_date as subscription_end_date,
          sub.is_active as subscription_active,
          CASE 
            WHEN sub.is_active = true THEN 'Active'
            WHEN sub.is_active = false THEN 'Inactive' 
            ELSE 'No Subscription'
          END as subscription_status
        FROM member_profiles mp
        LEFT JOIN users u ON mp.user_id = u.id
        LEFT JOIN subscriptions sub ON mp.id = sub.member_id AND sub.is_active = true
        LEFT JOIN membership_tiers mt ON COALESCE(sub.membership_tier_id, mp.membership_tier_id) = mt.id
        ORDER BY mp.created_at DESC
      `);
      res.json(rows);
    } catch (error) {
      console.error('Error fetching members:', error);
      res.status(500).json({ error: 'Failed to fetch members' });
    }
  });

  // Create trainer route
  app.post('/api/admin/create-trainer', async (req, res) => {
    try {
      const trainerData = req.body;

      // Validate required fields
      if (!trainerData.firstName || !trainerData.lastName || !trainerData.email) {
        return res.status(400).json({ message: "First name, last name, and email are required" });
      }

      console.log('Creating trainer with data:', trainerData);

      // Check if user with this email already exists in users table
      const { rows: existingUser } = await pool.query('SELECT * FROM users WHERE email = $1', [trainerData.email]);
      if (existingUser.length > 0) {
        return res.status(400).json({ message: "A user with this email already exists" });
      }

      // Check if trainer with this email already exists in trainer_profiles table
      const { rows: existingTrainer } = await pool.query('SELECT * FROM trainer_profiles WHERE email = $1', [trainerData.email]);
      if (existingTrainer.length > 0) {
        return res.status(400).json({ message: "A trainer with this email already exists" });
      }

      const client = await pool.connect();

      try {
        await client.query('BEGIN');

        // First, create user in users table
        const { rows: userRows } = await client.query(`
          INSERT INTO users (email, first_name, last_name, user_type, phone)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING id, email, first_name, last_name, user_type, phone, created_at
        `, [
          trainerData.email,
          trainerData.firstName,
          trainerData.lastName,
          'trainer',
          trainerData.phone || null
        ]);

        const user = userRows[0];
        console.log('User created:', user);

        // Then, create trainer profile in trainer_profiles table
        const { rows: trainerRows } = await client.query(`
          INSERT INTO trainer_profiles (user_id, first_name, last_name, email, phone, specializations, hourly_rate, experience_years, certifications, bio, is_available)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING *
        `, [
          user.id,
          trainerData.firstName,
          trainerData.lastName,
          trainerData.email,
          trainerData.phone || null,
          Array.isArray(trainerData.specializations) ? trainerData.specializations : [],
          trainerData.hourlyRate ? parseFloat(trainerData.hourlyRate) : 75.00,
          trainerData.experienceYears ? parseInt(trainerData.experienceYears) : 2,
          trainerData.certifications || '',
          trainerData.bio || '',
          true
        ]);

        const trainer = trainerRows[0];

        await client.query('COMMIT');
        console.log('Trainer created successfully in both tables:', { user, trainer });

        res.json({
          message: "Trainer created successfully in both users and trainer_profiles tables",
          trainer: {
            userId: trainer.id.toString(),
            firstName: trainer.first_name,
            lastName: trainer.last_name,
            email: trainer.email,
            phone: trainer.phone,
            specializations: trainer.specializations || [],
            hourlyRate: trainer.hourly_rate || 75,
            experienceYears: trainer.experience_years || 2,
            certifications: trainer.certifications || '',
            bio: trainer.bio || '',
            isAvailable: trainer.is_available !== false
          }
        });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error: any) {
      console.error("Error creating trainer:", error);
      res.status(500).json({ message: error.message || "Failed to create trainer" });
    }
  });

  // Update trainer route
  app.put('/api/admin/update-trainer/:trainerId', async (req, res) => {
    try {
      const { trainerId } = req.params;
      const updates = req.body;

      // Get trainer profile to find associated user_id
      const { rows: trainerRows } = await pool.query('SELECT user_id FROM trainer_profiles WHERE id = $1', [trainerId]);

      if (trainerRows.length === 0) {
        return res.status(404).json({ message: "Trainer not found" });
      }

      const userId = trainerRows[0].user_id;
      const client = await pool.connect();

      try {
        await client.query('BEGIN');

        // Update users table if basic info is being changed
        const userFields = [];
        const userValues = [];
        let userParamIndex = 1;

        if (updates.firstName) {
          userFields.push(`first_name = $${userParamIndex++}`);
          userValues.push(updates.firstName);
        }
        if (updates.lastName) {
          userFields.push(`last_name = $${userParamIndex++}`);
          userValues.push(updates.lastName);
        }
        if (updates.email) {
          userFields.push(`email = $${userParamIndex++}`);
          userValues.push(updates.email);
        }
        if (updates.phone !== undefined) {
          userFields.push(`phone = $${userParamIndex++}`);
          userValues.push(updates.phone);
        }

        if (userFields.length > 0 && userId) {
          userFields.push(`updated_at = CURRENT_TIMESTAMP`);
          userValues.push(userId);
          await client.query(
            `UPDATE users SET ${userFields.join(', ')} WHERE id = $${userParamIndex}`,
            userValues
          );
        }

        // Update trainer_profiles table
        const trainerFields = [];
        const trainerValues = [];
        let trainerParamIndex = 1;

        if (updates.firstName) {
          trainerFields.push(`first_name = $${trainerParamIndex++}`);
          trainerValues.push(updates.firstName);
        }
        if (updates.lastName) {
          trainerFields.push(`last_name = $${trainerParamIndex++}`);
          trainerValues.push(updates.lastName);
        }
        if (updates.email) {
          trainerFields.push(`email = $${trainerParamIndex++}`);
          trainerValues.push(updates.email);
        }
        if (updates.phone !== undefined) {
          trainerFields.push(`phone = $${trainerParamIndex++}`);
          trainerValues.push(updates.phone);
        }
        if (updates.specializations) {
          trainerFields.push(`specializations = $${trainerParamIndex++}`);
          trainerValues.push(updates.specializations);
        }
        if (updates.hourlyRate) {
          trainerFields.push(`hourly_rate = $${trainerParamIndex++}`);
          trainerValues.push(parseFloat(updates.hourlyRate));
        }
        if (updates.experienceYears) {
          trainerFields.push(`experience_years = $${trainerParamIndex++}`);
          trainerValues.push(parseInt(updates.experienceYears));
        }
        if (updates.certifications !== undefined) {
          trainerFields.push(`certifications = $${trainerParamIndex++}`);
          trainerValues.push(updates.certifications);
        }
        if (updates.bio !== undefined) {
          trainerFields.push(`bio = $${trainerParamIndex++}`);
          trainerValues.push(updates.bio);
        }
        if (updates.isAvailable !== undefined) {
          trainerFields.push(`is_available = $${trainerParamIndex++}`);
          trainerValues.push(updates.isAvailable);
        }

        if (trainerFields.length > 0) {
          trainerFields.push(`updated_at = CURRENT_TIMESTAMP`);
          trainerValues.push(trainerId);
          await client.query(
            `UPDATE trainer_profiles SET ${trainerFields.join(', ')} WHERE id = $${trainerParamIndex}`,
            trainerValues
          );
        }

        await client.query('COMMIT');
        res.json({ message: "Trainer updated successfully in both users and trainer_profiles tables" });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error: any) {
      console.error("Error updating trainer:", error);
      res.status(500).json({ message: error.message || "Failed to update trainer" });
    }
  });

  // Change trainer password route (admin only)
  app.post('/api/admin/change-trainer-password/:trainerId', async (req, res) => {
    try {
      const { trainerId } = req.params;
      const { newPassword } = req.body;

      if (!newPassword) {
        return res.status(400).json({ message: "New password is required" });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
      }

      // Get trainer profile to find associated user_id
      const { rows: trainerRows } = await pool.query('SELECT user_id FROM trainer_profiles WHERE id = $1', [trainerId]);

      if (trainerRows.length === 0) {
        return res.status(404).json({ message: "Trainer not found" });
      }

      const userId = trainerRows[0].user_id;

      if (!userId) {
        return res.status(400).json({ message: "No associated user account found for this trainer" });
      }

      // Hash the new password
      const hashedPassword = await authService.hashPassword(newPassword);

      // Update user password
      await pool.query('UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [hashedPassword, userId]);

      console.log(`Password changed for trainer ID: ${trainerId}, User ID: ${userId}`);

      res.json({ message: "Trainer password changed successfully" });
    } catch (error: any) {
      console.error("Error changing trainer password:", error);
      res.status(500).json({ message: error.message || "Failed to change trainer password" });
    }
  });

  // Delete trainer route
  app.delete('/api/admin/delete-trainer/:trainerId', async (req, res) => {
    try {
      const { trainerId } = req.params;

      // Get trainer profile to find associated user_id
      const { rows: trainerRows } = await pool.query('SELECT user_id FROM trainer_profiles WHERE id = $1', [trainerId]);

      if (trainerRows.length === 0) {
        return res.status(404).json({ message: "Trainer not found" });
      }

      const userId = trainerRows[0].user_id;
      const client = await pool.connect();

      try {
        await client.query('BEGIN');

        // Delete from trainer_profiles first (due to foreign key constraint)
        await client.query('DELETE FROM trainer_profiles WHERE id = $1', [trainerId]);

        // Delete from users table if user_id exists
        if (userId) {
          await client.query('DELETE FROM users WHERE id = $1', [userId]);
        }

        await client.query('COMMIT');
        console.log(`Trainer deleted from both tables. TrainerID: ${trainerId}, UserID: ${userId}`);

        res.json({ message: "Trainer deleted successfully from both users and trainer_profiles tables" });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error: any) {
      console.error("Error deleting trainer:", error);
      res.status(500).json({ message: error.message || "Failed to delete trainer" });
    }
  });

  // Create member route
  app.post('/api/admin/create-member', async (req, res) => {
    try {
      const memberData = req.body;

      // Validate required fields
      if (!memberData.firstName || !memberData.lastName || !memberData.email) {
        return res.status(400).json({ message: "First name, last name, and email are required" });
      }

      const client = await pool.connect();

      try {
        await client.query('BEGIN');

        // Create member profile with training type
        const member = await storage.createMemberProfile({
          firstName: memberData.firstName,
          lastName: memberData.lastName,
          email: memberData.email,
          phone: memberData.phone || null,
          membershipTierId: memberData.membershipTierId || null,
          emergencyContact: memberData.emergencyContact || memberData.email,
          fitnessGoals: memberData.fitnessGoals || 'General fitness improvement',
          trainingType: memberData.trainingType || 'one_on_one'
        });

        // Create subscription if membership tier is selected
        if (memberData.membershipTierId && memberData.trainingType) {
          const { rows: tierRows } = await client.query('SELECT * FROM membership_tiers WHERE id = $1', [memberData.membershipTierId]);

          if (tierRows.length > 0) {
            const tier = tierRows[0];
            let price = tier.one_on_one_price || 0;

            if (memberData.trainingType === 'two_people') {
              price = tier.two_people_price || 0;
            } else if (memberData.trainingType === 'three_people') {
              price = tier.three_people_price || 0;
            }

            const planType = `${tier.sessions}_session`;
            const endDate = new Date();
            const durationMonths = tier.duration === '1 month' ? 1 : tier.duration === '3 months' ? 3 : 6;
            endDate.setMonth(endDate.getMonth() + durationMonths);

            // Insert or update subscription
            await client.query(`
              INSERT INTO subscriptions (
                member_id, membership_tier_id, plan_type, training_type, 
                sessions_total, sessions_used, price_paid, start_date, end_date, is_active
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
              ON CONFLICT (member_id) 
              DO UPDATE SET 
                membership_tier_id = EXCLUDED.membership_tier_id,
                plan_type = EXCLUDED.plan_type,
                training_type = EXCLUDED.training_type,
                sessions_total = EXCLUDED.sessions_total,
                price_paid = EXCLUDED.price_paid,
                start_date = EXCLUDED.start_date,
                end_date = EXCLUDED.end_date,
                is_active = EXCLUDED.is_active,
                updated_at = CURRENT_TIMESTAMP
            `, [
              member.id, memberData.membershipTierId, planType, memberData.trainingType,
              tier.sessions, 0, price, new Date(), endDate, true
            ]);
          }
        }

        await client.query('COMMIT');

        res.json({
          message: "Member created successfully",
          member
        });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error: any) {
      console.error("Error creating member:", error);
      res.status(500).json({ message: error.message || "Failed to create member" });
    }
  });

  // Update member route
  app.put('/api/admin/update-member/:memberId', async (req, res) => {
    try {
      const { memberId } = req.params;
      const updates = req.body;

      await storage.updateMemberById(memberId, updates);
      res.json({ message: "Member updated successfully" });
    } catch (error: any) {
      console.error("Error updating member:", error);
      res.status(500).json({ message: error.message || "Failed to update member" });
    }
  });

  // Delete member route
  app.delete('/api/admin/delete-member/:memberId', async (req, res) => {
    try {
      const { memberId } = req.params;
      await storage.deleteUser(memberId); // This now handles member_profiles deletion
      res.json({ message: "Member deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting member:", error);
      res.status(500).json({ message: error.message || "Failed to delete member" });
    }
  });

  // Body assessments routes
  // Get body assessments for admin
  app.get('/api/admin/body-assessments', async (req, res) => {
    try {
      const { rows } = await pool.query(`
        SELECT ba.*,
               COALESCE(ba.client_name, CONCAT(mp.first_name, ' ', mp.last_name), CONCAT(u.first_name, ' ', u.last_name)) as memberName,
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
               JSON_BUILD_OBJECT(
                 'asymmetrical', false,
                 'headNeckAlignment', ba.head_neck_alignment,
                 'shoulderAlignment', ba.shoulder_alignment,
                 'upperBackAlignment', ba.upper_back_alignment,
                 'lowerBackAlignment', ba.lower_back_alignment,
                 'pelvicAlignment', ba.pelvic_alignment,
                 'hipKneeAlignment', ba.hip_knee_alignment,
                 'ankleAlignment', ba.ankle_alignment,
                 'spinalMobility', ba.spinal_mobility,
                 'recommendations', JSON_BUILD_OBJECT(
                   'stretching', ba.recommendations,
                   'strengthening', ''
                 )
               ) as posturalAssessment,
               ba.circumference_measurements as circumferenceMeasurements
        FROM body_assessments ba
        LEFT JOIN member_profiles mp ON ba.member_id = mp.id
        LEFT JOIN users u ON ba.member_id = u.id
        ORDER BY ba.created_at DESC
      `);

      const assessments = rows.map(row => ({
        ...row,
        _id: row.id,
        memberName: row.membername,
        bodyComposition: row.bodycomposition,
        posturalAssessment: row.posturalassessment,
        circumferenceMeasurements: row.circumference_measurements,
        createdAt: row.created_at,
        dateOfBirth: row.date_of_birth,
        emergencyContact: row.emergency_contact,
        bloodPressure: row.bp,
        afterTreadmillBP: row.bp_after_treadmill
      }));

      res.json(assessments);
    } catch (error: any) {
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

  app.put('/api/admin/body-assessments/:assessmentId', async (req, res) => {
    try {
      const { assessmentId } = req.params;
      const updates = req.body;

      // Update the assessment in the database
      await storage.updateBodyAssessment(assessmentId, updates);

      res.json({ message: "Assessment updated successfully" });
    } catch (error: any) {
      console.error("Error updating body assessment:", error);
      res.status(500).json({ message: error.message || "Failed to update body assessment" });
    }
  });

  app.post('/api/admin/body-assessments/:assessmentId/share/:trainerId', async (req, res) => {
    try {
      const { assessmentId, trainerId } = req.params;

      // Get the assessment details
      const { rows: assessmentRows } = await pool.query(`
        SELECT ba.*,
               COALESCE(ba.client_name, CONCAT(mp.first_name, ' ', mp.last_name), CONCAT(u.first_name, ' ', u.last_name)) as memberName,
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
               JSON_BUILD_OBJECT(
                 'headNeckAlignment', ba.head_neck_alignment,
                 'shoulderAlignment', ba.shoulder_alignment,
                 'upperBackAlignment', ba.upper_back_alignment,
                 'lowerBackAlignment', ba.lower_back_alignment,
                 'pelvicAlignment', ba.pelvic_alignment,
                 'hipKneeAlignment', ba.hip_knee_alignment,
                 'ankleAlignment', ba.ankle_alignment,
                 'spinalMobility', ba.spinal_mobility
               ) as posturalAssessment,
               ba.circumference_measurements as circumferenceMeasurements
        FROM body_assessments ba
        LEFT JOIN member_profiles mp ON ba.member_id = mp.id
        LEFT JOIN users u ON ba.member_id = u.id
        WHERE ba.id = $1
      `, [assessmentId]);

      if (assessmentRows.length === 0) {
        return res.status(404).json({ message: "Assessment not found" });
      }

      // Get trainer details
      const { rows: trainerRows } = await pool.query(`
        SELECT first_name, last_name, email
        FROM trainer_profiles
        WHERE id = $1
      `, [trainerId]);

      if (trainerRows.length === 0) {
        return res.status(404).json({ message: "Trainer not found" });
      }

      const assessment = assessmentRows[0];
      const trainer = trainerRows[0];

      // Prepare assessment data for email
      const assessmentData = {
        memberName: assessment.membername || assessment.client_name,
        clientName: assessment.client_name,
        age: assessment.age,
        height: assessment.height,
        dateOfBirth: assessment.date_of_birth,
        emergencyContact: assessment.emergency_contact,
        bloodPressure: assessment.bp,
        afterTreadmillBP: assessment.bp_after_treadmill,
        bodyComposition: assessment.bodycomposition,
        posturalAssessment: assessment.posturalassessment,
        circumferenceMeasurements: assessment.circumference_measurements,
        advice: assessment.advice,
        createdAt: assessment.created_at
      };

      // Send email to trainer
      const trainerName = `${trainer.first_name} ${trainer.last_name}`;
      await emailService.sendBodyAssessmentToTrainer(
        trainer.email,
        trainerName,
        assessmentData
      );

      console.log(`Body assessment shared with trainer: ${trainerName} (${trainer.email})`);

      res.json({ message: "Assessment shared successfully and email sent to trainer" });
    } catch (error: any) {
      console.error("Error sharing assessment:", error);
      res.status(500).json({ message: error.message || "Failed to share assessment" });
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

      // Get the inquiry details from inquiries table
      const { rows: inquiryRows } = await pool.query('SELECT * FROM inquiries WHERE id = $1', [inquiryId]);

      if (inquiryRows.length === 0) {
        return res.status(404).json({ message: "Inquiry not found" });
      }

      const inquiry = inquiryRows[0];

      // Create member profile
      const memberProfile = await storage.createMemberProfile({
        firstName: inquiry.first_name,
        lastName: inquiry.last_name,
        email: inquiry.email,
        phone: inquiry.phone,
        membershipTierId: req.body.memberData?.membershipTierId || null,
        emergencyContact: inquiry.phone || inquiry.email,
        fitnessGoals: "Converted from inquiry - General fitness improvement",
        trainingType: req.body.memberData?.trainingType || 'one_on_one'
      });

      // Create subscription if membership tier and training type are selected
      if (req.body.memberData?.membershipTierId && req.body.memberData?.trainingType) {
        const { rows: tierRows } = await pool.query('SELECT * FROM membership_tiers WHERE id = $1', [req.body.memberData.membershipTierId]);

        if (tierRows.length > 0) {
          const tier = tierRows[0];
          let price = tier.one_on_one_price || 0;

          if (req.body.memberData.trainingType === 'two_people') {
            price = tier.two_people_price || 0;
          } else if (req.body.memberData.trainingType === 'three_people') {
            price = tier.three_people_price || 0;
          }

          const planType = `${tier.sessions}_session`;
          const endDate = new Date();
          const durationMonths = tier.duration === '1 month' ? 1 : tier.duration === '3 months' ? 3 : 6;
          endDate.setMonth(endDate.getMonth() + durationMonths);

          // Insert subscription
          await pool.query(`
            INSERT INTO subscriptions (
              member_id, membership_tier_id, plan_type, training_type, 
              sessions_total, sessions_used, price_paid, start_date, end_date, is_active
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          `, [
            memberProfile.id, req.body.memberData.membershipTierId, planType, req.body.memberData.trainingType,
            tier.sessions, 0, price, new Date(), endDate, true
          ]);
        }
      }

      // Create body assessment if provided with proper validation
      if (req.body.assessmentData && Object.keys(req.body.assessmentData).length > 0) {
        // Clean and validate assessment data
        const cleanedAssessmentData = {
          memberId: memberProfile.id,
          dateOfBirth: req.body.assessmentData.dateOfBirth || null,
          age: req.body.assessmentData.age && req.body.assessmentData.age.toString().trim() !== '' ? parseInt(req.body.assessmentData.age) : null,
          height: req.body.assessmentData.height && req.body.assessmentData.height.toString().trim() !== '' ? parseFloat(req.body.assessmentData.height) : null,
          bloodPressure: req.body.assessmentData.bloodPressure || null,
          afterTreadmillBP: req.body.assessmentData.afterTreadmillBP || null,
          emergencyContact: req.body.assessmentData.emergencyContact || inquiry.phone || inquiry.email,
          bodyComposition: {
            bmi: req.body.assessmentData.bodyComposition?.bmi && req.body.assessmentData.bodyComposition.bmi.toString().trim() !== '' ? parseFloat(req.body.assessmentData.bodyComposition.bmi) : null,
            weight: req.body.assessmentData.bodyComposition?.weight && req.body.assessmentData.bodyComposition.weight.toString().trim() !== '' ? parseFloat(req.body.assessmentData.bodyComposition.weight) : null,
            muscle: req.body.assessmentData.bodyComposition?.muscle && req.body.assessmentData.bodyComposition.muscle.toString().trim() !== '' ? parseFloat(req.body.assessmentData.bodyComposition.muscle) : null,
            fat: req.body.assessmentData.bodyComposition?.fat && req.body.assessmentData.bodyComposition.fat.toString().trim() !== '' ? parseFloat(req.body.assessmentData.bodyComposition.fat) : null,
            saturatedFat: req.body.assessmentData.bodyComposition?.saturatedFat && req.body.assessmentData.bodyComposition.saturatedFat.toString().trim() !== '' ? parseFloat(req.body.assessmentData.bodyComposition.saturatedFat) : null,
            visceralFat: req.body.assessmentData.bodyComposition?.visceralFat && req.body.assessmentData.bodyComposition.visceralFat.toString().trim() !== '' ? parseFloat(req.body.assessmentData.bodyComposition.visceralFat) : null,
            bmr: req.body.assessmentData.bodyComposition?.bmr && req.body.assessmentData.bodyComposition.bmr.toString().trim() !== '' ? parseInt(req.body.assessmentData.bodyComposition.bmr) : null,
            bodyAge: req.body.assessmentData.bodyComposition?.bodyAge && req.body.assessmentData.bodyComposition.bodyAge.toString().trim() !== '' ? parseInt(req.body.assessmentData.bodyComposition.bodyAge) : null
          },
          posturalAssessment: req.body.assessmentData.posturalAssessment || {},
          circumferenceMeasurements: req.body.assessmentData.circumferenceMeasurements || {},
          advice: req.body.assessmentData.advice || null
        };

        await storage.createBodyAssessment(cleanedAssessmentData);
      }

      // Delete the inquiry from inquiries table
      await pool.query('DELETE FROM inquiries WHERE id = $1', [inquiryId]);

      res.json({
        message: "Inquiry converted successfully",
        member: memberProfile
      });
    } catch (error) {
      console.error("Error converting inquiry:", error);
      res.status(500).json({ message: "Failed to convert inquiry" });
    }
  });

  app.delete('/api/admin/inquiries/:inquiryId', async (req, res) => {
    try {
      const { inquiryId } = req.params;

      // Check if inquiry exists
      const { rows: existingRows } = await pool.query('SELECT * FROM inquiries WHERE id = $1', [inquiryId]);

      if (existingRows.length === 0) {
        return res.status(404).json({ message: "Inquiry not found" });
      }

      // Delete the inquiry from inquiries table
      await pool.query('DELETE FROM inquiries WHERE id = $1', [inquiryId]);

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

      // Validate and convert time format if provided
      const validateAndConvertTime = (timeStr: string): string | null => {
        if (!timeStr || timeStr.trim() === '') return null;

        // Handle 24-hour format (HH:MM)
        const time24Pattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (time24Pattern.test(timeStr)) {
          return timeStr;
        }

        // Handle 12-hour format (HH:MM AM/PM)
        const time12Pattern = /^([0-1]?[0-9]):[0-5][0-9]\s?(AM|PM)$/i;
        const match = time12Pattern.match(time12Pattern);
        if (match) {
          let [, hour, ampm] = match;
          let hourNum = parseInt(hour);

          if (ampm.toLowerCase() === 'pm' && hourNum !== 12) {
            hourNum += 12;
          } else if (ampm.toLowerCase() === 'am' && hourNum === 12) {
            hourNum = 0;
          }

          return `${hourNum.toString().padStart(2, '0')}:${timeStr.split(':')[1].split(' ')[0]}`;
        }

        return null;
      };

      const convertedCheckInTime = checkInTime ? validateAndConvertTime(checkInTime) : null;
      const convertedCheckOutTime = checkOutTime ? validateAndConvertTime(checkOutTime) : null;

      if (checkInTime && checkInTime.trim() !== '' && convertedCheckInTime === null) {
        return res.status(400).json({ message: "Invalid check-in time format. Use HH:MM or HH:MM AM/PM format." });
      }

      if (checkOutTime && checkOutTime.trim() !== '' && convertedCheckOutTime === null) {
        return res.status(400).json({ message: "Invalid check-out time format. Use HH:MM or HH:MM AM/PM format." });
      }

      // Check if attendance already exists for this trainer and date
      const { rows: existingAttendance } = await pool.query(`
        SELECT id FROM trainer_attendance 
        WHERE trainer_id = $1 AND date = $2
      `, [trainerId, date]);

      let attendance;

      if (existingAttendance.length > 0) {
        // Update existing attendance
        const { rows } = await pool.query(`
          UPDATE trainer_attendance 
          SET status = $1, check_in_time = $2, check_out_time = $3, notes = $4, updated_at = CURRENT_TIMESTAMP
          WHERE trainer_id = $5 AND date = $6
          RETURNING *
        `, [status, convertedCheckInTime, convertedCheckOutTime, notes || null, trainerId, date]);
        attendance = rows[0];
      } else {
        // Create new attendance record
        const { rows } = await pool.query(`
          INSERT INTO trainer_attendance (trainer_id, date, status, check_in_time, check_out_time, notes)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING *
        `, [trainerId, date, status, convertedCheckInTime, convertedCheckOutTime, notes || null]);
        attendance = rows[0];
      }

      console.log(`Trainer attendance recorded: ${status} for trainer ${trainerId} on ${date}`);

      res.json({
        message: "Attendance recorded successfully",
        attendance: {
          ...attendance,
          _id: attendance.id,
          trainerId: attendance.trainer_id,
          checkInTime: attendance.check_in_time,
          checkOutTime: attendance.check_out_time
        }
      });
    } catch (error: any) {
      console.error("Error recording attendance:", error);
      res.status(500).json({ message: error.message || "Failed to record attendance" });
    }
  });

  // Member session attendance routes
  app.post('/api/admin/member-session-attendance', async (req, res) => {
    try {
      const { memberId, trainerId, sessionDate, sessionTime, sessionType, status, notes, memberName, trainerName, durationMinutes } = req.body;

      if (!memberId || !trainerId || !sessionDate) {
        return res.status(400).json({ message: "Missing required fields: memberId, trainerId, sessionDate" });
      }

      const attendance = await storage.recordMemberSessionAttendance({
        memberId,
        trainerId,
        sessionDate,
        sessionTime,
        sessionType: sessionType || 'Training Session',
        status: status || 'attended',
        notes,
        memberName,
        trainerName,
        durationMinutes: durationMinutes || 60
      });

      res.json({
        message: "Member session attendance recorded successfully",
        attendance
      });
    } catch (error: any) {
      console.error("Error recording member session attendance:", error);
      res.status(500).json({ message: error.message || "Failed to record member session attendance" });
    }
  });

  app.get('/api/admin/member-session-attendance', async (req, res) => {
    try {
      const { memberId, trainerId, sessionDate, startDate, endDate } = req.query;
      const filters: any = {};

      if (memberId) filters.memberId = memberId;
      if (trainerId) filters.trainerId = trainerId;
      if (sessionDate) filters.sessionDate = sessionDate;
      if (startDate && endDate) {
        filters.dateRange = { start: startDate, end: endDate };
      }

      const attendance = await storage.getMemberSessionAttendance(filters);
      res.json(attendance);
    } catch (error: any) {
      console.error("Error fetching member session attendance:", error);
      res.status(500).json({ message: "Failed to fetch member session attendance" });
    }
  });

  app.put('/api/admin/member-session-attendance/:attendanceId', async (req, res) => {
    try {
      const { attendanceId } = req.params;
      const updates = req.body;

      await storage.updateMemberSessionAttendance(attendanceId, updates);
      res.json({ message: "Member session attendance updated successfully" });
    } catch (error: any) {
      console.error("Error updating member session attendance:", error);
      res.status(500).json({ message: error.message || "Failed to update member session attendance" });
    }
  });

  app.delete('/api/admin/member-session-attendance/:attendanceId', async (req, res) => {
    try {
      const { attendanceId } = req.params;
      await storage.deleteMemberSessionAttendance(attendanceId);
      res.json({ message: "Member session attendance deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting member session attendance:", error);
      res.status(500).json({ message: error.message || "Failed to delete member session attendance" });
    }
  });

  // Get assigned clients for a trainer
  app.get('/api/trainer/assigned-clients', async (req: any, res) => {
    try {
      const userEmail = req.session.user?.email;
      const userName = req.session.user?.firstName + ' ' + req.session.user?.lastName;

      if (!userEmail) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      console.log(`Fetching assigned clients for trainer: ${userName} (${userEmail})`);

      // Get trainer profile by email
      const { rows: trainerRows } = await pool.query('SELECT id FROM trainer_profiles WHERE email = $1', [userEmail]);
      if (trainerRows.length === 0) {
        console.log(`No trainer profile found for email: ${userEmail}`);
        return res.json([]);
      }
      const trainerId = trainerRows[0].id;
      console.log(`Found trainer ID: ${trainerId}`);

      const assignments = await storage.getMemberTrainerAssignments({ trainerId });
      console.log(`Found ${assignments?.length || 0} assignments for trainer ${trainerId}`);

      res.json(assignments || []);
    } catch (error: any) {
      console.error('Error fetching assigned clients:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Member trainer assignment routes
  app.post('/api/admin/assign-trainer', async (req, res) => {
    try {
      const { memberId, trainerId, assignedDate, notes } = req.body;

      if (!memberId || !trainerId) {
        return res.status(400).json({ message: "Missing required fields: memberId, trainerId" });
      }

      // Validate that the member exists in member_profiles
      const { rows: memberRows } = await pool.query('SELECT id FROM member_profiles WHERE id = $1', [memberId]);
      if (memberRows.length === 0) {
        return res.status(400).json({ message: "Invalid member ID - member not found" });
      }

      // Validate that the trainer exists in trainer_profiles  
      const { rows: trainerRows } = await pool.query('SELECT id FROM trainer_profiles WHERE id = $1', [trainerId]);
      if (trainerRows.length === 0) {
        return res.status(400).json({ message: "Invalid trainer ID - trainer not found" });
      }

      const assignment = await storage.assignTrainerToMember({
        memberId,
        trainerId,
        assignedDate,
        notes
      });

      res.json({
        message: "Trainer assigned to member successfully",
        assignment
      });
    } catch (error: any) {
      console.error("Error assigning trainer to member:", error);
      res.status(500).json({ message: error.message || "Failed to assign trainer to member" });
    }
  });

  app.delete('/api/admin/remove-trainer/:memberId/:trainerId', async (req, res) => {
    try {
      const { memberId, trainerId } = req.params;

      if (!memberId || !trainerId) {
        return res.status(400).json({ message: "Missing required parameters: memberId, trainerId" });
      }

      const result = await storage.removeTrainerFromMember(memberId, trainerId);

      res.json({
        message: "Trainer removed from client successfully",
        result
      });
    } catch (error: any) {
      console.error("Error removing trainer from client:", error);
      res.status(500).json({ message: error.message || "Failed to remove trainer from client" });
    }
  });

  app.get('/api/admin/trainer-assignments', async (req, res) => {
    try {
      const assignments = await storage.getMemberTrainerAssignments({});
      res.json(assignments);
    } catch (error: any) {
      console.error("Error fetching trainer assignments:", error);
      res.status(500).json({ message: error.message || "Failed to fetch trainer assignments" });
    }
  });

  app.get('/api/admin/trainer-assignments', async (req, res) => {
    try {
      const { memberId, trainerId } = req.query;
      const filters: any = {};

      if (memberId) filters.memberId = memberId;
      if (trainerId) filters.trainerId = trainerId;

      const assignments = await storage.getMemberTrainerAssignments(filters);
      res.json(assignments);
    } catch (error: any) {
      console.error("Error fetching trainer assignments:", error);
      res.status(500).json({ message: "Failed to fetch trainer assignments" });
    }
  });

  app.delete('/api/admin/remove-trainer/:memberId/:trainerId', async (req, res) => {
    try {
      const { memberId, trainerId } = req.params;
      await storage.removeTrainerFromMember(memberId, trainerId);
      res.json({ message: "Trainer removed from client successfully" });
    } catch (error: any) {
      console.error("Error removing trainer from client:", error);
      res.status(500).json({ message: error.message || "Failed to remove trainer from client" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}