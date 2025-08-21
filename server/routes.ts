
import type { Express } from "express";
import { createServer, type Server } from "http";
import session from 'express-session';
import { storage } from "./storage.js";
import { initializeDatabase, pool } from "./db.js";

// Authentication middleware
const isAuthenticated = (req: any, res: any, next: any) => {
  // Check session-based auth first
  if (req.session.user) {
    req.user = { claims: { sub: req.session.user.id } };
    return next();
  }
  
  // For development, allow some endpoints without auth
  if (req.path.startsWith('/api/admin') || req.path.startsWith('/api/test')) {
    return next();
  }
  
  // Check if user exists in database as fallback
  if (req.user?.claims?.sub) {
    return next();
  }
  
  return res.status(401).json({ message: "Authentication required" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session middleware with secret
  app.use(session({
    secret: 'reshape-fitness-dev-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
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
      
      // Check hardcoded credentials first (more reliable)
      if (email === "admin" && password === "admin") {
        userData = {
          id: "1",
          email: "admin@reshape.com",
          firstName: "Admin",
          lastName: "User",
          userType: "admin",
          role: "admin",
          first_name: "Admin",
          last_name: "User",
          user_type: "admin"
        };
      } else if (email === "trainer" && password === "trainer") {
        userData = {
          id: "2", 
          email: "trainer@reshape.com",
          firstName: "Trainer",
          lastName: "User",
          userType: "trainer",
          role: "trainer",
          first_name: "Trainer",
          last_name: "User",
          user_type: "trainer"
        };
      } else if (email === "member" && password === "member") {
        userData = {
          id: "3", 
          email: "member@reshape.com",
          firstName: "Member",
          lastName: "Test",
          userType: "member",
          role: "member",
          first_name: "Member",
          last_name: "Test",
          user_type: "member"
        };
      } else {
        // Try database lookup as fallback
        try {
          let dbUser = null;
          
          if (email === "admin" && password === "admin") {
            dbUser = await storage.getUserByEmail("admin@reshape.com");
          } else if (email === "trainer" && password === "trainer") {
            dbUser = await storage.getUserByEmail("trainer@reshape.com");
          } else if (email === "member" && password === "member") {
            dbUser = await storage.getUserByEmail("member@reshape.com");
          }
          
          if (dbUser) {
            userData = {
              id: dbUser.id,
              email: dbUser.email,
              firstName: dbUser.firstName,
              lastName: dbUser.lastName,
              userType: dbUser.userType,
              role: dbUser.userType
            };
          }
        } catch (dbError) {
          console.error("Database lookup error:", dbError);
        }
        
        if (!userData) {
          return res.status(401).json({ message: "Invalid credentials" });
        }
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

  // Contact form submission (store in PostgreSQL using a simple table approach)
  app.post('/api/contact', async (req, res) => {
    try {
      const { firstName, lastName, email, phone, location, interest, message } = req.body;
      
      // Validate required fields
      if (!firstName || !lastName || !email || !phone || !location || !interest || !message) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // For now, create a contact submission user record
      const contactUser = await storage.createUser({
        email: `contact_${Date.now()}_${email}`,
        firstName,
        lastName,
        userType: 'member',
        phone
      });
      
      console.log('Contact form submitted:', { firstName, lastName, email, location, interest });
      
      res.json({ 
        message: "Contact form submitted successfully",
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
          id: user.id,
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
      const userId = req.user?.claims?.sub || '1';
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Get additional profile data based on user type
      let profileData = null;
      if (user?.userType === 'member') {
        profileData = await storage.getMemberProfile(userId);
      } else if (user?.userType === 'trainer') {
        profileData = await storage.getTrainerProfile(userId);
      }

      // Ensure consistent structure
      const userData = {
        id: user.id,
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
        SELECT a.*, u.first_name, u.last_name, u.email 
        FROM attendance a 
        JOIN member_profiles mp ON a.member_id = mp.id 
        JOIN users u ON mp.user_id = u.id 
        WHERE a.date = $1 
        ORDER BY a.check_in_time DESC
      `, [date]);
      res.json(rows);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      res.status(500).json({ message: "Failed to fetch attendance" });
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

  // Admin routes
  app.get('/api/admin/members', async (req, res) => {
    try {
      const members = await storage.getAllMembers();
      res.json(members);
    } catch (error) {
      console.error("Error fetching members:", error);
      res.status(500).json({ message: "Failed to fetch members" });
    }
  });

  app.get('/api/admin/trainers', async (req, res) => {
    try {
      const trainers = await storage.getAllTrainers();
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
      
      if (!firstName || !lastName || !email || !membershipTierId) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const newUser = await storage.createUser({
        email,
        firstName,
        lastName,
        userType: 'member',
        phone: phone || null
      });

      const memberProfile = await storage.createMemberProfile({
        userId: newUser.id,
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

      const newUser = await storage.createUser({
        email,
        firstName,
        lastName,
        userType: 'trainer'
      });

      const trainerProfile = await storage.createTrainerProfile({
        userId: newUser.id,
        specializations: specializations || [],
        hourlyRate: hourlyRate || 75.00,
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

      await storage.deleteUser(userId);
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

      await storage.deleteUser(userId);
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

      await storage.updateMemberById(userId, updates);
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

      await storage.updateTrainerById(userId, updates);
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
