import { PrismaClient } from "@prisma/client";
import { PERIODS } from "~/utils/utils";
// import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

interface IPass {
  startAt: Date;
  endAt?: Date;
  reason: string;
  isPersonal: boolean;
  studentId: string;
  userId: string;
}

interface IStudent {
  firstName: string;
  lastName: string;
  period: string;
  notes: string;
  passes: Pick<
    IPass,
    "startAt" | "endAt" | "reason" | "isPersonal" | "userId"
  >[];
  randomPasses: number;
  userId: string;
}

const firstNames = ["Bobby", "Alice", "Lincoln", "Brittney"];
const lastNames = ["A", "B", "C", "D", "E", "F"];
const reasons = [
  "Drink",
  "Swig Run",
  "Phone Call",
  "Bathroom",
  "idk, brb",
  "",
  "",
];

const generateRandomStudent = (userId: string) => {
  return {
    firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
    lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
    period: PERIODS[Math.floor(Math.random() * PERIODS.length)],
    notes: "",
    passes: [],
    randomPasses: Math.floor(Math.random() * 4),
    userId,
  };
};

const generateRandomPass = () => {
  const startAt = new Date();
  const startHours = Math.floor(Math.random() * 6) + 8;
  const startMinutes = Math.floor(Math.random() * 60);
  const daysAgo = Math.floor(Math.random() * 90);
  const duration = Math.floor(Math.random() * 15 * 60); // 15 minutes in seconds

  startAt.setDate(startAt.getDate() - daysAgo);
  startAt.setHours(startHours);
  startAt.setMinutes(startMinutes);
  const endAt = new Date(startAt.getTime() + duration * 1000);

  return {
    startAt,
    endAt,
    reason: reasons[Math.floor(Math.random() * reasons.length)],
    isPersonal: !!Math.floor(Math.random() * 2),
  };
};

const createPass = async (pass: IPass) => {
  await prisma.pass.create({
    data: {
      ...pass,
    },
  });
};

const createStudent = async ({
  firstName,
  lastName,
  period,
  notes,
  passes,
  randomPasses,
  userId,
}: IStudent) => {
  console.log(`Creating ${firstName} ${lastName}`);
  const student = await prisma.student.create({
    data: {
      firstName,
      lastName,
      period,
      notes,
      userId,
    },
  });

  passes.map((pass) => createPass({ ...pass, studentId: student.id }));
  for (let i = 0; i < randomPasses; i++) {
    createPass({ ...generateRandomPass(), studentId: student.id, userId });
  }
};

async function seed() {
  const email = "hectorscout@hectorscout.com";
  const externalId = "105062547402906055816";

  // cleanup the existing database
  const existingUser = await prisma.user.findFirst({ where: { externalId } });
  if (existingUser) {
    await prisma.user.delete({ where: { id: existingUser.id } }).catch(() => {
      // no worries if it doesn't exist yet
    });
  }

  const user = await prisma.user.create({
    data: {
      externalId,
      email,
    },
  });

  const students = [
    {
      firstName: "Trixie",
      lastName: "Racer",
      period: "A1",
      notes: `She's the best.`,
      passes: [
        {
          startAt: new Date("2022-01-01 08:30"),
          endAt: new Date("2022-01-01 08:34:05"),
          reason: "Drink",
          isPersonal: true,
          userId: user.id,
        },
        {
          startAt: new Date("2022-01-02 14:10"),
          endAt: new Date("2022-01-02 14:34:05"),
          reason: "Teacher's errand (Swig run)",
          isPersonal: false,
          userId: user.id,
        },
      ],
      randomPasses: 0,
      userId: user.id,
    },
    {
      firstName: "Naan",
      lastName: "Bread",
      period: "A2",
      notes: `Naan is delicious, but has no business being in space. So, no space walks.`,
      passes: [],
      randomPasses: 0,
      userId: user.id,
    },
    {
      firstName: "Hector",
      lastName: "Scout",
      period: "B1",
      notes: `So much time in the halls...`,
      passes: [
        {
          startAt: new Date("2022-01-01 08:30"),
          endAt: new Date("2022-01-01 08:34:05"),
          reason: "Drink",
          isPersonal: true,
          userId: user.id,
        },
        {
          startAt: new Date("2022-01-02 14:10"),
          endAt: new Date("2022-01-02 14:34:05"),
          reason: "Teacher's errand (Swig run)",
          isPersonal: false,
          userId: user.id,
        },
        {
          startAt: new Date("2022-01-03 14:10"),
          endAt: new Date("2022-01-03 15:34:05"),
          reason: "",
          isPersonal: false,
          userId: user.id,
        },
      ],
      randomPasses: 20,
      userId: user.id,
    },
  ];

  for (let i = 0; i < 40; i++) {
    students.push(generateRandomStudent(user.id));
  }

  students.map(createStudent);

  console.log(`Database has been seeded, how neat is that. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
