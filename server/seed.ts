import { db } from "./db";
import { users, classes, workouts, socialPosts, activities } from "@shared/schema";

async function seed() {
  try {
    console.log("Seeding database...");

    // Create admin user
    const [admin] = await db.insert(users).values({
      username: "admin",
      password: "admin123",
      email: "admin@fitconnect.com",
      fullName: "Admin User",
      isAdmin: true,
      profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      plan: "premium",
      status: "active",
    }).returning();

    // Create regular users
    const [carlos] = await db.insert(users).values({
      username: "carlos",
      password: "carlos123",
      email: "carlos@email.com",
      fullName: "Carlos Méndez",
      isAdmin: false,
      profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      plan: "premium",
      status: "active",
    }).returning();

    const [maria] = await db.insert(users).values({
      username: "maria",
      password: "maria123",
      email: "maria@email.com",
      fullName: "María García",
      isAdmin: false,
      profileImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
      plan: "basic",
      status: "active",
    }).returning();

    // Create classes
    const [class1] = await db.insert(classes).values({
      name: "Cardio HIIT",
      description: "High intensity interval training",
      instructorName: "Ana López",
      startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      endTime: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours from now
      capacity: 20,
      currentEnrollment: 15,
      type: "cardio",
      status: "active",
    }).returning();

    const [class2] = await db.insert(classes).values({
      name: "Fuerza Total",
      description: "Entrenamiento de fuerza completo",
      instructorName: "Miguel Ruiz",
      startTime: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours from now
      endTime: new Date(Date.now() + 9 * 60 * 60 * 1000), // 9 hours from now
      capacity: 15,
      currentEnrollment: 12,
      type: "strength",
      status: "active",
    }).returning();

    // Seed workout data for Carlos
    const workoutData = [
      {
        userId: carlos.id,
        exerciseName: "Press Banca",
        weight: "80",
        reps: 8,
        sets: 3,
        type: "strength",
        duration: null,
        calories: null,
      },
      {
        userId: carlos.id,
        exerciseName: "Sentadillas",
        weight: "100",
        reps: 10,
        sets: 4,
        type: "strength",
        duration: null,
        calories: null,
      },
      {
        userId: carlos.id,
        exerciseName: "Peso Muerto",
        weight: "120",
        reps: 6,
        sets: 3,
        type: "strength",
        duration: null,
        calories: null,
      },
      {
        userId: carlos.id,
        exerciseName: "Press Militar",
        weight: "45",
        reps: 8,
        sets: 3,
        type: "strength",
        duration: null,
        calories: null,
      },
      {
        userId: carlos.id,
        exerciseName: "Dominadas",
        weight: "0",
        reps: 12,
        sets: 3,
        type: "strength",
        duration: null,
        calories: null,
      },
    ];

    for (const workout of workoutData) {
      await db.insert(workouts).values(workout);
    }

    // Seed social posts
    const socialPostData = [
      {
        userId: carlos.id,
        content: "¡Nuevo PR en press banca! 80kg x 8 reps 💪 El progreso constante da sus frutos.",
        imageUrl: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=300&fit=crop",
        workoutId: null,
        likes: 12,
        comments: 3,
      },
      {
        userId: maria.id,
        content: "Terminé mi primera clase de HIIT 🔥 ¡Qué intensidad! Ya tengo ganas de la próxima sesión.",
        imageUrl: null,
        workoutId: null,
        likes: 8,
        comments: 2,
      },
      {
        userId: admin.id,
        content: "Recordatorio: Mañana tenemos clase de Fuerza Total a las 18:00. ¡Prepárense para entrenar duro! 🏋️‍♂️",
        imageUrl: null,
        workoutId: null,
        likes: 15,
        comments: 5,
      },
    ];

    for (const post of socialPostData) {
      await db.insert(socialPosts).values(post);
    }

    // Create some activities
    const activityData = [
      {
        type: "new_member",
        title: "Nuevo miembro",
        description: `${carlos.fullName} se unió al gimnasio`,
        userId: carlos.id,
        classId: null,
      },
      {
        type: "class_created",
        title: "Nueva clase creada",
        description: `${class1.name} - ${class1.instructorName}`,
        userId: null,
        classId: class1.id,
      },
      {
        type: "new_member",
        title: "Nuevo miembro",
        description: `${maria.fullName} se unió al gimnasio`,
        userId: maria.id,
        classId: null,
      },
    ];

    for (const activity of activityData) {
      await db.insert(activities).values(activity);
    }

    console.log("Database seeded successfully!");
    console.log(`Created ${workoutData.length} workouts`);
    console.log(`Created ${socialPostData.length} social posts`);
    console.log(`Created ${activityData.length} activities`);
    
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

// Run the seed function if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seed().then(() => {
    console.log("Seeding completed!");
    process.exit(0);
  }).catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  });
}

export { seed };