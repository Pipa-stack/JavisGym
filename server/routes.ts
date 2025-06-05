import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertClassSchema, 
  insertReservationSchema, 
  insertWorkoutSchema,
  insertSocialPostSchema,
  insertActivitySchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Update last visit
      await storage.updateUser(user.id, { lastVisit: new Date() });

      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const user = await storage.createUser(userData);
      res.status(201).json({ user: { ...user, password: undefined } });
    } catch (error) {
      res.status(400).json({ message: "Registration failed" });
    }
  });

  // User routes
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const usersWithoutPasswords = users.map(user => ({ ...user, password: undefined }));
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Class routes
  app.get("/api/classes", async (req, res) => {
    try {
      const classes = await storage.getAllClasses();
      res.json(classes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch classes" });
    }
  });

  app.get("/api/classes/today", async (req, res) => {
    try {
      const today = new Date();
      const classes = await storage.getClassesByDate(today);
      res.json(classes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch today's classes" });
    }
  });

  app.post("/api/classes", async (req, res) => {
    try {
      const classData = insertClassSchema.parse(req.body);
      const gymClass = await storage.createClass(classData);
      
      // Create activity
      await storage.createActivity({
        type: "class_created",
        title: "Nueva clase creada",
        description: `${gymClass.name} - ${gymClass.instructorName}`,
        classId: gymClass.id,
      });

      res.status(201).json(gymClass);
    } catch (error) {
      res.status(400).json({ message: "Failed to create class" });
    }
  });

  app.put("/api/classes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const updatedClass = await storage.updateClass(id, updates);
      if (!updatedClass) {
        return res.status(404).json({ message: "Class not found" });
      }

      res.json(updatedClass);
    } catch (error) {
      res.status(500).json({ message: "Failed to update class" });
    }
  });

  app.delete("/api/classes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteClass(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Class not found" });
      }

      res.json({ message: "Class deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete class" });
    }
  });

  // Reservation routes
  app.post("/api/reservations", async (req, res) => {
    try {
      const reservationData = insertReservationSchema.parse(req.body);
      
      // Check if class exists and has capacity
      const gymClass = await storage.getClass(reservationData.classId);
      if (!gymClass) {
        return res.status(404).json({ message: "Class not found" });
      }

      if (gymClass.currentEnrollment >= gymClass.capacity) {
        return res.status(400).json({ message: "Class is full" });
      }

      const reservation = await storage.createReservation(reservationData);
      
      // Create activity
      const user = await storage.getUser(reservationData.userId);
      if (user) {
        await storage.createActivity({
          type: "reservation_made",
          title: "Nueva reserva",
          description: `${user.fullName} se inscribió en ${gymClass.name}`,
          userId: user.id,
          classId: gymClass.id,
        });
      }

      res.status(201).json(reservation);
    } catch (error) {
      res.status(400).json({ message: "Failed to create reservation" });
    }
  });

  app.get("/api/reservations/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const reservations = await storage.getUserReservations(userId);
      res.json(reservations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user reservations" });
    }
  });

  app.delete("/api/reservations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.cancelReservation(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Reservation not found" });
      }

      res.json({ message: "Reservation cancelled successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to cancel reservation" });
    }
  });

  // Workout routes
  app.post("/api/workouts", async (req, res) => {
    try {
      const workoutData = insertWorkoutSchema.parse(req.body);
      const workout = await storage.createWorkout(workoutData);
      res.status(201).json(workout);
    } catch (error) {
      res.status(400).json({ message: "Failed to create workout" });
    }
  });

  app.get("/api/workouts/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const workouts = await storage.getUserWorkouts(userId);
      res.json(workouts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user workouts" });
    }
  });

  app.get("/api/workouts/user/:userId/recent", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const workouts = await storage.getRecentWorkouts(userId, limit);
      res.json(workouts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent workouts" });
    }
  });

  // Social post routes
  app.get("/api/social/posts", async (req, res) => {
    try {
      const posts = await storage.getAllSocialPosts();
      
      // Enrich posts with user data
      const enrichedPosts = await Promise.all(
        posts.map(async (post) => {
          const user = await storage.getUser(post.userId);
          return {
            ...post,
            author: user ? {
              id: user.id,
              fullName: user.fullName,
              profileImage: user.profileImage,
              isAdmin: user.isAdmin,
            } : null,
          };
        })
      );

      res.json(enrichedPosts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch social posts" });
    }
  });

  app.post("/api/social/posts", async (req, res) => {
    try {
      const postData = insertSocialPostSchema.parse(req.body);
      const post = await storage.createSocialPost(postData);
      res.status(201).json(post);
    } catch (error) {
      res.status(400).json({ message: "Failed to create social post" });
    }
  });

  app.post("/api/social/posts/:id/like", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const post = await storage.likeSocialPost(id);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to like post" });
    }
  });

  // Activity routes
  app.get("/api/activities", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const activities = await storage.getRecentActivities(limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  // Statistics routes
  app.get("/api/stats", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const classes = await storage.getAllClasses();
      const today = new Date();
      const todayClasses = await storage.getClassesByDate(today);

      const stats = {
        activeMembers: users.filter(u => u.status === "active").length,
        todayClasses: todayClasses.length,
        monthlyRevenue: 24680, // Mock revenue
        satisfaction: 4.8,
        weeklyWorkouts: 12, // Mock data
        caloriesBurned: 2450, // Mock data
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
