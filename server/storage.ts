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

export const storage = new MemStorage();
