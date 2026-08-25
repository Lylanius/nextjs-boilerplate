import { StudentRecord, TeacherAssignment, UkCurriculumYear } from "./types";

export interface ClassCohort {
  id: string;
  name: string;
  yearGroup: UkCurriculumYear;
  academicYear: string;
  students: StudentRecord[];
}

export const SAMPLE_CLASSES: ClassCohort[] = [
  {
    id: "class_y4_beech",
    name: "Year 4 Beech Class",
    yearGroup: "ks2-y4",
    academicYear: "2025/2026",
    students: [
      {
        id: "std_1",
        name: "Amara Davies",
        yearGroup: "ks2-y4",
        avatarSeed: "amara",
        level: 14,
        accuracyRate: 96,
        avgRecallMs: 1150,
        totalAnswered: 840,
        mtcScore: 25,
        satsScore: 36,
        masteryStatus: "Master",
        troubleSpots: ["12×11"],
        lastActive: "Today, 09:15",
      },
      {
        id: "std_2",
        name: "Oliver Chen",
        yearGroup: "ks2-y4",
        avatarSeed: "oliver",
        level: 11,
        accuracyRate: 88,
        avgRecallMs: 1850,
        totalAnswered: 620,
        mtcScore: 23,
        satsScore: 31,
        masteryStatus: "Fluent",
        troubleSpots: ["7×8", "8×9"],
        lastActive: "Today, 10:40",
      },
      {
        id: "std_3",
        name: "Chloe Evans",
        yearGroup: "ks2-y4",
        avatarSeed: "chloe",
        level: 8,
        accuracyRate: 72,
        avgRecallMs: 3200,
        totalAnswered: 390,
        mtcScore: 18,
        satsScore: 22,
        masteryStatus: "Developing",
        troubleSpots: ["6×7", "7×8", "9×8", "12×8"],
        lastActive: "Yesterday",
      },
      {
        id: "std_4",
        name: "Liam Taylor",
        yearGroup: "ks2-y4",
        avatarSeed: "liam",
        level: 6,
        accuracyRate: 59,
        avgRecallMs: 4400,
        totalAnswered: 280,
        mtcScore: 14,
        satsScore: 17,
        masteryStatus: "Emerging",
        troubleSpots: ["6×6", "6×7", "7×7", "7×8", "8×8", "9×7"],
        lastActive: "3 days ago",
      },
      {
        id: "std_5",
        name: "Maya Patel",
        yearGroup: "ks2-y4",
        avatarSeed: "maya",
        level: 16,
        accuracyRate: 98,
        avgRecallMs: 920,
        totalAnswered: 1150,
        mtcScore: 25,
        satsScore: 39,
        masteryStatus: "Master",
        troubleSpots: [],
        lastActive: "Today, 11:20",
      },
      {
        id: "std_6",
        name: "Ethan Wright",
        yearGroup: "ks2-y4",
        avatarSeed: "ethan",
        level: 10,
        accuracyRate: 84,
        avgRecallMs: 2100,
        totalAnswered: 530,
        mtcScore: 21,
        satsScore: 28,
        masteryStatus: "Fluent",
        troubleSpots: ["8×7", "12×6"],
        lastActive: "Yesterday",
      },
      {
        id: "std_7",
        name: "Sophie Jenkins",
        yearGroup: "ks2-y4",
        avatarSeed: "sophie",
        level: 7,
        accuracyRate: 68,
        avgRecallMs: 3800,
        totalAnswered: 340,
        mtcScore: 16,
        satsScore: 20,
        masteryStatus: "Developing",
        troubleSpots: ["7×9", "8×6", "9×9"],
        lastActive: "2 days ago",
      },
    ],
  },
  {
    id: "class_y6_oak",
    name: "Year 6 Oak Class (SATs Cohort)",
    yearGroup: "ks2-y6",
    academicYear: "2025/2026",
    students: [
      {
        id: "std_601",
        name: "Marcus Sterling",
        yearGroup: "ks2-y6",
        avatarSeed: "marcus",
        level: 22,
        accuracyRate: 95,
        avgRecallMs: 1200,
        totalAnswered: 1420,
        mtcScore: 25,
        satsScore: 38,
        masteryStatus: "Master",
        troubleSpots: ["Fractions (unlike denominators)"],
        lastActive: "Today, 08:50",
      },
      {
        id: "std_602",
        name: "Zoe Richardson",
        yearGroup: "ks2-y6",
        avatarSeed: "zoe",
        level: 19,
        accuracyRate: 91,
        avgRecallMs: 1450,
        totalAnswered: 1100,
        mtcScore: 24,
        satsScore: 35,
        masteryStatus: "Fluent",
        troubleSpots: ["Percentages of amounts (15%, 35%)"],
        lastActive: "Today, 10:15",
      },
      {
        id: "std_603",
        name: "Noah Brooks",
        yearGroup: "ks2-y6",
        avatarSeed: "noah",
        level: 13,
        accuracyRate: 76,
        avgRecallMs: 2900,
        totalAnswered: 680,
        mtcScore: 20,
        satsScore: 27,
        masteryStatus: "Developing",
        troubleSpots: ["BIDMAS Order of Operations", "Linear Algebra"],
        lastActive: "Yesterday",
      },
      {
        id: "std_604",
        name: "Freya Scott",
        yearGroup: "ks2-y6",
        avatarSeed: "freya",
        level: 9,
        accuracyRate: 64,
        avgRecallMs: 4100,
        totalAnswered: 450,
        mtcScore: 17,
        satsScore: 19,
        masteryStatus: "Emerging",
        troubleSpots: ["Long Division", "Fraction Multiplication", "BIDMAS"],
        lastActive: "4 days ago",
      },
    ],
  },
  {
    id: "class_eyfs_daisy",
    name: "Reception Daisy Class",
    yearGroup: "eyfs-reception",
    academicYear: "2025/2026",
    students: [
      {
        id: "std_r1",
        name: "Jack Wilson",
        yearGroup: "eyfs-reception",
        avatarSeed: "jack",
        level: 5,
        accuracyRate: 92,
        avgRecallMs: 2500,
        totalAnswered: 180,
        mtcScore: 0,
        satsScore: 0,
        masteryStatus: "Master",
        troubleSpots: ["Number Bonds to 10"],
        lastActive: "Today, 09:30",
      },
      {
        id: "std_r2",
        name: "Ella Morgan",
        yearGroup: "eyfs-reception",
        avatarSeed: "ella",
        level: 4,
        accuracyRate: 85,
        avgRecallMs: 3100,
        totalAnswered: 140,
        mtcScore: 0,
        satsScore: 0,
        masteryStatus: "Fluent",
        troubleSpots: ["1 Less Than"],
        lastActive: "Yesterday",
      },
      {
        id: "std_r3",
        name: "Leo Cooper",
        yearGroup: "eyfs-reception",
        avatarSeed: "leo",
        level: 3,
        accuracyRate: 70,
        avgRecallMs: 4200,
        totalAnswered: 95,
        mtcScore: 0,
        satsScore: 0,
        masteryStatus: "Developing",
        troubleSpots: ["Ten-Frames (empty counts)"],
        lastActive: "2 days ago",
      },
    ],
  },
];

export const SAMPLE_ASSIGNMENTS: TeacherAssignment[] = [
  {
    id: "asg_1",
    title: "Year 4 MTC Official Check Practice",
    targetYear: "ks2-y4",
    topic: "Full 12×12 Multiplication MTC (6s Timer)",
    targetQuestions: 25,
    minAccuracyPercent: 80,
    dueDate: "2026-09-05",
    assignedToClass: "class_y4_beech",
    completedCount: 5,
    totalStudents: 7,
  },
  {
    id: "asg_2",
    title: "Tricky Tables Focus: 7s, 8s & 9s Blitz",
    targetYear: "ks2-y4",
    topic: "7, 8 and 9 times tables rapid recall",
    targetQuestions: 30,
    minAccuracyPercent: 85,
    dueDate: "2026-09-08",
    assignedToClass: "class_y4_beech",
    completedCount: 3,
    totalStudents: 7,
  },
  {
    id: "asg_3",
    title: "Year 6 SATs Arithmetic Paper 1 Sprint",
    targetYear: "ks2-y6",
    topic: "BIDMAS, Fractions Arithmetic & Percentages",
    targetQuestions: 36,
    minAccuracyPercent: 75,
    dueDate: "2026-09-12",
    assignedToClass: "class_y6_oak",
    completedCount: 2,
    totalStudents: 4,
  },
  {
    id: "asg_4",
    title: "Ten-Frame Mastery & Bonds to 10",
    targetYear: "eyfs-reception",
    topic: "Subitising and visual 10-frame pairs",
    targetQuestions: 15,
    minAccuracyPercent: 80,
    dueDate: "2026-09-06",
    assignedToClass: "class_eyfs_daisy",
    completedCount: 2,
    totalStudents: 3,
  },
];

const TEACHER_STORAGE_KEY = "grid_guardians_teacher_data_v1";

export interface TeacherStoreData {
  classes: ClassCohort[];
  assignments: TeacherAssignment[];
  teacherPin: string;
  schoolName: string;
  teacherName: string;
  sendTimerSeconds: number; // 6s default
  sendReadAloud: boolean;
  sendHighContrast: boolean;
}

export const DEFAULT_TEACHER_DATA: TeacherStoreData = {
  classes: SAMPLE_CLASSES,
  assignments: SAMPLE_ASSIGNMENTS,
  teacherPin: "1234",
  schoolName: "St. Jude's Primary Academy",
  teacherName: "Mr. Henderson",
  sendTimerSeconds: 6,
  sendReadAloud: false,
  sendHighContrast: false,
};

export function loadTeacherData(): TeacherStoreData {
  if (typeof window === "undefined") return DEFAULT_TEACHER_DATA;
  try {
    const raw = localStorage.getItem(TEACHER_STORAGE_KEY);
    if (!raw) return DEFAULT_TEACHER_DATA;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_TEACHER_DATA,
      ...parsed,
      classes: parsed.classes?.length ? parsed.classes : SAMPLE_CLASSES,
      assignments: parsed.assignments?.length ? parsed.assignments : SAMPLE_ASSIGNMENTS,
    };
  } catch (e) {
    console.error("Failed to load teacher data:", e);
    return DEFAULT_TEACHER_DATA;
  }
}

export function saveTeacherData(data: TeacherStoreData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TEACHER_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save teacher data:", e);
  }
}
