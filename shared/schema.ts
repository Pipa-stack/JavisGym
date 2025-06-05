import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  profileImage: text("profile_image"),
  plan: text("plan").notNull().default("basic"), // basic, premium
  status: text("status").notNull().default("active"), // active, suspended
  joinDate: timestamp("join_date").defaultNow().notNull(),
  lastVisit: timestamp("last_visit").defaultNow().notNull(),
});

export const classes = pgTable("classes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  instructorName: text("instructor_name").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  capacity: integer("capacity").notNull(),
  currentEnrollment: integer("current_enrollment").default(0).notNull(),
  type: text("type").notNull(), // cardio, strength, yoga, etc.
  status: text("status").notNull().default("active"), // active, cancelled
});

export const reservations = pgTable("reservations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  classId: integer("class_id").notNull(),
  status: text("status").notNull().default("confirmed"), // confirmed, cancelled, pending
  reservedAt: timestamp("reserved_at").defaultNow().notNull(),
});

export const workouts = pgTable("workouts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  exerciseName: text("exercise_name").notNull(),
  weight: decimal("weight"),
  reps: integer("reps"),
  sets: integer("sets"),
  duration: integer("duration"), // in minutes
  calories: integer("calories"),
  type: text("type").notNull(), // strength, cardio
  date: timestamp("date").defaultNow().notNull(),
});

export const socialPosts = pgTable("social_posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  likes: integer("likes").default(0).notNull(),
  comments: integer("comments").default(0).notNull(),
  workoutId: integer("workout_id"), // optional link to workout
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // new_member, class_completed, maintenance, review
  title: text("title").notNull(),
  description: text("description").notNull(),
  userId: integer("user_id"),
  classId: integer("class_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  joinDate: true,
  lastVisit: true,
});

export const insertClassSchema = createInsertSchema(classes).omit({
  id: true,
  currentEnrollment: true,
});

export const insertReservationSchema = createInsertSchema(reservations).omit({
  id: true,
  reservedAt: true,
});

export const insertWorkoutSchema = createInsertSchema(workouts).omit({
  id: true,
  date: true,
});

export const insertSocialPostSchema = createInsertSchema(socialPosts).omit({
  id: true,
  likes: true,
  comments: true,
  createdAt: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type GymClass = typeof classes.$inferSelect;
export type InsertClass = z.infer<typeof insertClassSchema>;
export type Reservation = typeof reservations.$inferSelect;
export type InsertReservation = z.infer<typeof insertReservationSchema>;
export type Workout = typeof workouts.$inferSelect;
export type InsertWorkout = z.infer<typeof insertWorkoutSchema>;
export type SocialPost = typeof socialPosts.$inferSelect;
export type InsertSocialPost = z.infer<typeof insertSocialPostSchema>;
export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
