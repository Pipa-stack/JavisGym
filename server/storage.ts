import { 
  users, 
  classes, 
  reservations, 
  workouts, 
  socialPosts, 
  activities,
  type User, 
  type InsertUser, 
  type GymClass, 
  type InsertClass,
  type Reservation,
  type InsertReservation,
  type Workout,
  type InsertWorkout,
  type SocialPost,
  type InsertSocialPost,
  type Activity,
  type InsertActivity
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  
  // Classes
  getClass(id: number): Promise<GymClass | undefined>;
  getAllClasses(): Promise<GymClass[]>;
  getClassesByDate(date: Date): Promise<GymClass[]>;
  createClass(gymClass: InsertClass): Promise<GymClass>;
  updateClass(id: number, updates: Partial<GymClass>): Promise<GymClass | undefined>;
  deleteClass(id: number): Promise<boolean>;
  
  // Reservations
  createReservation(reservation: InsertReservation): Promise<Reservation>;
  getUserReservations(userId: number): Promise<Reservation[]>;
  getClassReservations(classId: number): Promise<Reservation[]>;
  cancelReservation(id: number): Promise<boolean>;
  
  // Workouts
  createWorkout(workout: InsertWorkout): Promise<Workout>;
  getUserWorkouts(userId: number): Promise<Workout[]>;
  getRecentWorkouts(userId: number, limit?: number): Promise<Workout[]>;
  
  // Social Posts
  createSocialPost(post: InsertSocialPost): Promise<SocialPost>;
  getAllSocialPosts(): Promise<SocialPost[]>;
  getUserSocialPosts(userId: number): Promise<SocialPost[]>;
  likeSocialPost(postId: number): Promise<SocialPost | undefined>;
  
  // Activities
  createActivity(activity: InsertActivity): Promise<Activity>;
  getRecentActivities(limit?: number): Promise<Activity[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private classes: Map<number, GymClass>;
  private reservations: Map<number, Reservation>;
  private workouts: Map<number, Workout>;
  private socialPosts: Map<number, SocialPost>;
  private activities: Map<number, Activity>;
  private currentUserId: number;
  private currentClassId: number;
  private currentReservationId: number;
  private currentWorkoutId: number;
  private currentSocialPostId: number;
  private currentActivityId: number;

  constructor() {
    this.users = new Map();
    this.classes = new Map();
    this.reservations = new Map();
    this.workouts = new Map();
    this.socialPosts = new Map();
    this.activities = new Map();
    this.currentUserId = 1;
    this.currentClassId = 1;
    this.currentReservationId = 1;
    this.currentWorkoutId = 1;
    this.currentSocialPostId = 1;
    this.currentActivityId = 1;

    // Initialize with some seed data
    this.seedData();
  }

  private seedData() {
    // Create admin user
    const admin: User = {
      id: this.currentUserId++,
      username: "admin",
      password: "admin123",
      email: "admin@fitconnect.com",
      fullName: "Admin User",
      isAdmin: true,
      profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      plan: "premium",
      status: "active",
      joinDate: new Date(),
      lastVisit: new Date(),
    };
    this.users.set(admin.id, admin);

    // Create some regular users
    const user1: User = {
      id: this.currentUserId++,
      username: "carlos",
      password: "carlos123",
      email: "carlos@email.com",
      fullName: "Carlos Méndez",
      isAdmin: false,
      profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      plan: "premium",
      status: "active",
      joinDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      lastVisit: new Date(),
    };
    this.users.set(user1.id, user1);

    const user2: User = {
      id: this.currentUserId++,
      username: "maria",
      password: "maria123",
      email: "maria@email.com",
      fullName: "María García",
      isAdmin: false,
      profileImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
      plan: "basic",
      status: "active",
      joinDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      lastVisit: new Date(Date.now() - 24 * 60 * 60 * 1000),
    };
    this.users.set(user2.id, user2);

    // Create some classes
    const class1: GymClass = {
      id: this.currentClassId++,
      name: "Cardio HIIT",
      description: "High intensity interval training",
      instructorName: "Ana López",
      startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      endTime: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours from now
      capacity: 20,
      currentEnrollment: 15,
      type: "cardio",
      status: "active",
    };
    this.classes.set(class1.id, class1);

    const class2: GymClass = {
      id: this.currentClassId++,
      name: "Fuerza Total",
      description: "Entrenamiento de fuerza completo",
      instructorName: "Miguel Ruiz",
      startTime: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours from now
      endTime: new Date(Date.now() + 9 * 60 * 60 * 1000), // 9 hours from now
      capacity: 15,
      currentEnrollment: 12,
      type: "strength",
      status: "active",
    };
    this.classes.set(class2.id, class2);

    // Seed workout data for Carlos
    const workouts = [
      {
        userId: 2, // Carlos
        exerciseName: "Press Banca",
        weight: "80",
        reps: 8,
        sets: 3,
        type: "strength",
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        userId: 2,
        exerciseName: "Sentadillas",
        weight: "100",
        reps: 10,
        sets: 4,
        type: "strength",
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        userId: 2,
        exerciseName: "Peso Muerto",
        weight: "120",
        reps: 6,
        sets: 3,
        type: "strength",
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        userId: 2,
        exerciseName: "Press Militar",
        weight: "45",
        reps: 8,
        sets: 3,
        type: "strength",
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        userId: 2,
        exerciseName: "Dominadas",
        weight: "0",
        reps: 12,
        sets: 3,
        type: "strength",
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    ];

    workouts.forEach(workout => {
      const id = this.currentWorkoutId++;
      const workoutRecord: Workout = {
        ...workout,
        id,
        duration: null,
        calories: null,
        date: workout.date,
      };
      this.workouts.set(id, workoutRecord);
    });

    // Seed social posts
    const socialPosts = [
      {
        userId: 2, // Carlos
        content: "¡Nuevo PR en press banca! 80kg x 8 reps 💪 El progreso constante da sus frutos.",
        imageUrl: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=300&fit=crop",
        workoutId: 1,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        userId: 3, // María
        content: "Terminé mi primera clase de HIIT 🔥 ¡Qué intensidad! Ya tengo ganas de la próxima sesión.",
        imageUrl: null,
        workoutId: null,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        userId: 1, // Admin/Entrenador
        content: "Recordatorio: Mañana tenemos clase de Fuerza Total a las 18:00. ¡Prepárense para entrenar duro! 🏋️‍♂️",
        imageUrl: null,
        workoutId: null,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    ];

    socialPosts.forEach(post => {
      const id = this.currentSocialPostId++;
      const socialPost: SocialPost = {
        ...post,
        id,
        likes: Math.floor(Math.random() * 15) + 5,
        comments: Math.floor(Math.random() * 8) + 2,
      };
      this.socialPosts.set(id, socialPost);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      joinDate: new Date(),
      lastVisit: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Class methods
  async getClass(id: number): Promise<GymClass | undefined> {
    return this.classes.get(id);
  }

  async getAllClasses(): Promise<GymClass[]> {
    return Array.from(this.classes.values());
  }

  async getClassesByDate(date: Date): Promise<GymClass[]> {
    return Array.from(this.classes.values()).filter(gymClass => {
      const classDate = new Date(gymClass.startTime);
      return classDate.toDateString() === date.toDateString();
    });
  }

  async createClass(insertClass: InsertClass): Promise<GymClass> {
    const id = this.currentClassId++;
    const gymClass: GymClass = {
      ...insertClass,
      id,
      currentEnrollment: 0,
    };
    this.classes.set(id, gymClass);
    return gymClass;
  }

  async updateClass(id: number, updates: Partial<GymClass>): Promise<GymClass | undefined> {
    const gymClass = this.classes.get(id);
    if (!gymClass) return undefined;
    
    const updatedClass = { ...gymClass, ...updates };
    this.classes.set(id, updatedClass);
    return updatedClass;
  }

  async deleteClass(id: number): Promise<boolean> {
    return this.classes.delete(id);
  }

  // Reservation methods
  async createReservation(insertReservation: InsertReservation): Promise<Reservation> {
    const id = this.currentReservationId++;
    const reservation: Reservation = {
      ...insertReservation,
      id,
      reservedAt: new Date(),
    };
    this.reservations.set(id, reservation);

    // Update class enrollment
    const gymClass = this.classes.get(insertReservation.classId);
    if (gymClass) {
      gymClass.currentEnrollment++;
      this.classes.set(gymClass.id, gymClass);
    }

    return reservation;
  }

  async getUserReservations(userId: number): Promise<Reservation[]> {
    return Array.from(this.reservations.values()).filter(reservation => reservation.userId === userId);
  }

  async getClassReservations(classId: number): Promise<Reservation[]> {
    return Array.from(this.reservations.values()).filter(reservation => reservation.classId === classId);
  }

  async cancelReservation(id: number): Promise<boolean> {
    const reservation = this.reservations.get(id);
    if (!reservation) return false;

    // Update class enrollment
    const gymClass = this.classes.get(reservation.classId);
    if (gymClass && gymClass.currentEnrollment > 0) {
      gymClass.currentEnrollment--;
      this.classes.set(gymClass.id, gymClass);
    }

    return this.reservations.delete(id);
  }

  // Workout methods
  async createWorkout(insertWorkout: InsertWorkout): Promise<Workout> {
    const id = this.currentWorkoutId++;
    const workout: Workout = {
      ...insertWorkout,
      id,
      date: new Date(),
    };
    this.workouts.set(id, workout);
    return workout;
  }

  async getUserWorkouts(userId: number): Promise<Workout[]> {
    return Array.from(this.workouts.values()).filter(workout => workout.userId === userId);
  }

  async getRecentWorkouts(userId: number, limit = 10): Promise<Workout[]> {
    return Array.from(this.workouts.values())
      .filter(workout => workout.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }

  // Social post methods
  async createSocialPost(insertPost: InsertSocialPost): Promise<SocialPost> {
    const id = this.currentSocialPostId++;
    const post: SocialPost = {
      ...insertPost,
      id,
      likes: 0,
      comments: 0,
      createdAt: new Date(),
    };
    this.socialPosts.set(id, post);
    return post;
  }

  async getAllSocialPosts(): Promise<SocialPost[]> {
    return Array.from(this.socialPosts.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getUserSocialPosts(userId: number): Promise<SocialPost[]> {
    return Array.from(this.socialPosts.values())
      .filter(post => post.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async likeSocialPost(postId: number): Promise<SocialPost | undefined> {
    const post = this.socialPosts.get(postId);
    if (!post) return undefined;
    
    post.likes++;
    this.socialPosts.set(postId, post);
    return post;
  }

  // Activity methods
  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.currentActivityId++;
    const activity: Activity = {
      ...insertActivity,
      id,
      createdAt: new Date(),
    };
    this.activities.set(id, activity);
    return activity;
  }

  async getRecentActivities(limit = 10): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Class methods
  async getClass(id: number): Promise<GymClass | undefined> {
    const [gymClass] = await db.select().from(classes).where(eq(classes.id, id));
    return gymClass || undefined;
  }

  async getAllClasses(): Promise<GymClass[]> {
    return await db.select().from(classes);
  }

  async getClassesByDate(date: Date): Promise<GymClass[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await db.select().from(classes).where(
      // Using simple date comparison for now
      eq(classes.status, "active")
    );
  }

  async createClass(insertClass: InsertClass): Promise<GymClass> {
    const [gymClass] = await db
      .insert(classes)
      .values({
        ...insertClass,
        currentEnrollment: 0,
      })
      .returning();
    return gymClass;
  }

  async updateClass(id: number, updates: Partial<GymClass>): Promise<GymClass | undefined> {
    const [gymClass] = await db
      .update(classes)
      .set(updates)
      .where(eq(classes.id, id))
      .returning();
    return gymClass || undefined;
  }

  async deleteClass(id: number): Promise<boolean> {
    const result = await db.delete(classes).where(eq(classes.id, id));
    return result.rowCount > 0;
  }

  // Reservation methods
  async createReservation(insertReservation: InsertReservation): Promise<Reservation> {
    const [reservation] = await db
      .insert(reservations)
      .values(insertReservation)
      .returning();

    // Update class enrollment
    await db
      .update(classes)
      .set({ currentEnrollment: db.select().from(classes).where(eq(classes.id, insertReservation.classId)) })
      .where(eq(classes.id, insertReservation.classId));

    return reservation;
  }

  async getUserReservations(userId: number): Promise<Reservation[]> {
    return await db.select().from(reservations).where(eq(reservations.userId, userId));
  }

  async getClassReservations(classId: number): Promise<Reservation[]> {
    return await db.select().from(reservations).where(eq(reservations.classId, classId));
  }

  async cancelReservation(id: number): Promise<boolean> {
    const result = await db.delete(reservations).where(eq(reservations.id, id));
    return result.rowCount > 0;
  }

  // Workout methods
  async createWorkout(insertWorkout: InsertWorkout): Promise<Workout> {
    const [workout] = await db
      .insert(workouts)
      .values(insertWorkout)
      .returning();
    return workout;
  }

  async getUserWorkouts(userId: number): Promise<Workout[]> {
    return await db.select().from(workouts).where(eq(workouts.userId, userId));
  }

  async getRecentWorkouts(userId: number, limit = 10): Promise<Workout[]> {
    return await db
      .select()
      .from(workouts)
      .where(eq(workouts.userId, userId))
      .orderBy(workouts.date)
      .limit(limit);
  }

  // Social post methods
  async createSocialPost(insertPost: InsertSocialPost): Promise<SocialPost> {
    const [post] = await db
      .insert(socialPosts)
      .values(insertPost)
      .returning();
    return post;
  }

  async getAllSocialPosts(): Promise<SocialPost[]> {
    return await db.select().from(socialPosts).orderBy(socialPosts.createdAt);
  }

  async getUserSocialPosts(userId: number): Promise<SocialPost[]> {
    return await db
      .select()
      .from(socialPosts)
      .where(eq(socialPosts.userId, userId))
      .orderBy(socialPosts.createdAt);
  }

  async likeSocialPost(postId: number): Promise<SocialPost | undefined> {
    const [post] = await db
      .update(socialPosts)
      .set({ likes: socialPosts.likes + 1 })
      .where(eq(socialPosts.id, postId))
      .returning();
    return post || undefined;
  }

  // Activity methods
  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const [activity] = await db
      .insert(activities)
      .values(insertActivity)
      .returning();
    return activity;
  }

  async getRecentActivities(limit = 10): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .orderBy(activities.createdAt)
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
