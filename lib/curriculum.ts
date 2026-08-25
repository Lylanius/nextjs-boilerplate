import { QuestionFact, UkCurriculumYear } from "./types";

export interface CurriculumStageInfo {
  id: UkCurriculumYear;
  code: string;
  name: string;
  ageRange: string;
  keyTopics: string[];
  tables?: number[];
  description: string;
  badge: string;
  color: string;
}

export const CURRICULUM_STAGES: Record<UkCurriculumYear, CurriculumStageInfo> = {
  "eyfs-nursery": {
    id: "eyfs-nursery",
    code: "EYFS-N",
    name: "Nursery & Pre-School",
    ageRange: "Ages 3–4",
    keyTopics: ["Subitising 1–5", "Object Counting", "1 More / 1 Less", "Visual Matching"],
    description: "Perceptual subitising, visual counting patterns, and early number senses.",
    badge: "🌱",
    color: "from-emerald-500 to-teal-600",
  },
  "eyfs-reception": {
    id: "eyfs-reception",
    code: "EYFS-R",
    name: "Reception",
    ageRange: "Ages 4–5",
    keyTopics: ["Ten-Frames", "Number Bonds to 5 & 10", "Doubles to 10", "Spatial Patterns"],
    description: "Interactive ten-frames, structured dot patterns, and foundational number bonds.",
    badge: "🌸",
    color: "from-teal-500 to-cyan-600",
  },
  "ks1-y1": {
    id: "ks1-y1",
    code: "KS1-Y1",
    name: "Year 1 (Key Stage 1)",
    ageRange: "Ages 5–6",
    keyTopics: ["Bonds to 20", "Counting in 2s, 5s, 10s", "Doubles & Halves", "Addition & Subtraction"],
    description: "Number bonds within 20, missing number equations, and skip counting.",
    badge: "⭐",
    color: "from-sky-500 to-blue-600",
  },
  "ks1-y2": {
    id: "ks1-y2",
    code: "KS1-Y2",
    name: "Year 2 (Key Stage 1)",
    ageRange: "Ages 6–7",
    tables: [2, 5, 10],
    keyTopics: ["2, 5, 10 Times Tables", "Division Inverses", "Bonds to 100", "Halves & Quarters"],
    description: "Foundational multiplication, division fact families, and simple fractions.",
    badge: "⚡",
    color: "from-blue-500 to-indigo-600",
  },
  "ks2-y3": {
    id: "ks2-y3",
    code: "KS2-Y3",
    name: "Year 3 (Lower KS2)",
    ageRange: "Ages 7–8",
    tables: [2, 3, 4, 5, 8, 10],
    keyTopics: ["3, 4, 8 Times Tables", "3-Digit Arithmetic", "Unit Fractions", "Column Addition"],
    description: "Table expansion (3s, 4s, 8s), mental arithmetic to 1,000, and like-denominator fractions.",
    badge: "⚔️",
    color: "from-indigo-500 to-violet-600",
  },
  "ks2-y4": {
    id: "ks2-y4",
    code: "KS2-Y4",
    name: "Year 4 (DfE MTC Focus)",
    ageRange: "Ages 8–9",
    tables: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    keyTopics: ["All 12×12 Times Tables", "DfE MTC Simulator", "Tenths & Hundredths", "Roman Numerals"],
    description: "Full 12×12 multiplication mastery aligned with the statutory Year 4 MTC exam.",
    badge: "🛡️",
    color: "from-purple-500 to-fuchsia-600",
  },
  "ks2-y5": {
    id: "ks2-y5",
    code: "KS2-Y5",
    name: "Year 5 (Upper KS2)",
    ageRange: "Ages 9–10",
    tables: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    keyTopics: ["Prime Numbers", "Square & Cube Numbers", "x10 / 100 / 1000", "Percentages & Decimals"],
    description: "Primes, square/cube powers, multi-digit arithmetic, and fraction equivalence.",
    badge: "🔥",
    color: "from-amber-500 to-orange-600",
  },
  "ks2-y6": {
    id: "ks2-y6",
    code: "KS2-Y6",
    name: "Year 6 (KS2 SATs Prep)",
    ageRange: "Ages 10–11",
    tables: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    keyTopics: ["SATs Arithmetic", "BIDMAS / Order of Ops", "Fraction Operations (+,-,×,÷)", "Percentages & Algebra"],
    description: "Comprehensive Year 6 SATs Paper 1 Arithmetic preparation, fractions, BIDMAS & algebra.",
    badge: "👑",
    color: "from-rose-500 to-red-600",
  },
  "all": {
    id: "all",
    code: "ALL",
    name: "All Times Tables & Mastery",
    ageRange: "All Ages",
    tables: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    keyTopics: ["Complete 1–12 Tables", "Division Facts", "Speed Arena", "Boss Dungeons"],
    description: "Full times table mastery and rapid recall across all 144 core facts.",
    badge: "🌟",
    color: "from-indigo-600 to-purple-700",
  },
};

// Legacy compatibility helper
export const CURRICULUM_TABLES = CURRICULUM_STAGES;

// High frequency MTC tables per UK DfE framework
const MTC_HIGH_FREQUENCY = [6, 7, 8, 9, 12];

// Subitising dot templates for EYFS
export const DOT_PATTERNS: Record<number, string[]> = {
  1: ["center"],
  2: ["top-left", "bottom-right"],
  3: ["top-left", "center", "bottom-right"],
  4: ["top-left", "top-right", "bottom-left", "bottom-right"],
  5: ["top-left", "top-right", "center", "bottom-left", "bottom-right"],
  6: ["top-left", "top-right", "mid-left", "mid-right", "bottom-left", "bottom-right"],
};

/**
 * Generates an early years (Nursery, Reception, Year 1) visual math question
 */
export function generateEyfsQuestion(stage: "eyfs-nursery" | "eyfs-reception" | "ks1-y1"): QuestionFact {
  if (stage === "eyfs-nursery") {
    const questionType = Math.random();
    if (questionType < 0.4) {
      // Subitising 1-5
      const count = Math.floor(Math.random() * 5) + 1;
      const opts = generateMultipleChoiceOptions(count, 1, 5);
      return {
        num1: count,
        num2: 0,
        operation: "add",
        answer: count,
        formattedText: "How many dots do you see?",
        subtopic: "Subitising",
        visualType: "dots",
        visualData: { count },
        options: opts,
        stepHint: "Look at the dots pattern quickly without counting 1 by 1!",
      };
    } else if (questionType < 0.7) {
      // 1 More / 1 Less up to 5
      const isMore = Math.random() > 0.5;
      const base = isMore ? Math.floor(Math.random() * 4) + 1 : Math.floor(Math.random() * 4) + 2;
      const answer = isMore ? base + 1 : base - 1;
      const opts = generateMultipleChoiceOptions(answer, 1, 6);
      return {
        num1: base,
        num2: 1,
        operation: isMore ? "add" : "subtract",
        answer: answer,
        formattedText: isMore ? `What is 1 more than ${base}?` : `What is 1 less than ${base}?`,
        subtopic: "1 More / 1 Less",
        visualType: "apples",
        visualData: { count: base },
        options: opts,
        stepHint: isMore ? `Count up 1 step after ${base}!` : `Count back 1 step before ${base}!`,
      };
    } else {
      // Object Counting
      const count = Math.floor(Math.random() * 5) + 1;
      const opts = generateMultipleChoiceOptions(count, 1, 6);
      return {
        num1: count,
        num2: 0,
        operation: "add",
        answer: count,
        formattedText: `Count the friendly stars!`,
        subtopic: "Counting",
        visualType: "apples",
        visualData: { count },
        options: opts,
      };
    }
  }

  if (stage === "eyfs-reception") {
    const qType = Math.random();
    if (qType < 0.4) {
      // Ten-frame recognition or filling
      const filled = Math.floor(Math.random() * 10) + 1;
      const askEmpty = Math.random() > 0.6 && filled < 10;
      const answer = askEmpty ? 10 - filled : filled;
      const text = askEmpty ? "How many EMPTY boxes are in the 10-frame?" : "How many counters are in the 10-frame?";
      const opts = generateMultipleChoiceOptions(answer, 0, 10);
      return {
        num1: filled,
        num2: 10,
        operation: "add",
        answer: answer,
        formattedText: text,
        subtopic: "Ten-Frames",
        visualType: "tenframe",
        visualData: { filled, total: 10 },
        options: opts,
        stepHint: "A full ten-frame has 10 spaces. The top row has 5.",
      };
    } else if (qType < 0.75) {
      // Number bonds to 5 or 10
      const target = Math.random() > 0.5 ? 10 : 5;
      const part1 = Math.floor(Math.random() * (target + 1));
      const missing = target - part1;
      const opts = generateMultipleChoiceOptions(missing, 0, target);
      return {
        num1: part1,
        num2: missing,
        operation: "add",
        answer: missing,
        formattedText: `${part1} + ? = ${target}`,
        subtopic: `Bonds to ${target}`,
        visualType: "bonds",
        visualData: { part1, part2: missing, whole: target },
        options: opts,
        stepHint: `What number added to ${part1} makes a total of ${target}?`,
      };
    } else {
      // Doubles up to 10
      const n = Math.floor(Math.random() * 5) + 1;
      const answer = n * 2;
      const opts = generateMultipleChoiceOptions(answer, 2, 10);
      return {
        num1: n,
        num2: n,
        operation: "add",
        answer: answer,
        formattedText: `Double ${n} is ?`,
        subtopic: "Doubles",
        visualType: "standard",
        options: opts,
        stepHint: `Double means adding the number to itself: ${n} + ${n} = ${answer}`,
      };
    }
  }

  // KS1 Year 1
  const roll = Math.random();
  if (roll < 0.35) {
    // Number bonds to 20
    const part1 = Math.floor(Math.random() * 19) + 1;
    const missing = 20 - part1;
    const opts = generateMultipleChoiceOptions(missing, 1, 20);
    return {
      num1: part1,
      num2: missing,
      operation: "add",
      answer: missing,
      formattedText: `${part1} + ? = 20`,
      subtopic: "Bonds to 20",
      visualType: "bonds",
      visualData: { part1, part2: missing, whole: 20 },
      options: opts,
    };
  } else if (roll < 0.7) {
    // Skip counting in 2s, 5s, 10s
    const step = [2, 5, 10][Math.floor(Math.random() * 3)];
    const start = step * (Math.floor(Math.random() * 3) + 1);
    const seq = [start, start + step, start + step * 2, start + step * 3];
    const missingIdx = Math.floor(Math.random() * 3) + 1;
    const answer = seq[missingIdx];
    const seqText = seq.map((v, i) => (i === missingIdx ? "?" : v)).join(", ");
    const opts = generateMultipleChoiceOptions(answer, Math.max(0, answer - step * 2), answer + step * 2);
    return {
      num1: step,
      num2: missingIdx,
      operation: "add",
      answer: answer,
      formattedText: `Find missing number: ${seqText}`,
      subtopic: `Counting in ${step}s`,
      visualType: "standard",
      options: opts,
      stepHint: `Look at the pattern: we are counting in steps of ${step}!`,
    };
  } else {
    // Addition & subtraction within 20
    const isAdd = Math.random() > 0.5;
    if (isAdd) {
      const a = Math.floor(Math.random() * 11) + 4;
      const b = Math.floor(Math.random() * (20 - a)) + 1;
      return {
        num1: a,
        num2: b,
        operation: "add",
        answer: a + b,
        formattedText: `${a} + ${b} =`,
        subtopic: "Addition within 20",
        visualType: "standard",
      };
    } else {
      const a = Math.floor(Math.random() * 11) + 10; // 10-20
      const b = Math.floor(Math.random() * 9) + 1;
      return {
        num1: a,
        num2: b,
        operation: "subtract",
        answer: a - b,
        formattedText: `${a} - ${b} =`,
        subtopic: "Subtraction within 20",
        visualType: "standard",
      };
    }
  }
}

/**
 * Generates Year 6 KS2 SATs Arithmetic Questions (Paper 1 Style)
 */
export function generateSatsQuestion(): QuestionFact {
  const category = Math.random();

  if (category < 0.25) {
    // BIDMAS / Order of Operations
    const subType = Math.floor(Math.random() * 3);
    if (subType === 0) {
      // a + b x c
      const b = Math.floor(Math.random() * 7) + 3;
      const c = Math.floor(Math.random() * 8) + 2;
      const a = Math.floor(Math.random() * 20) + 5;
      const answer = a + b * c;
      return {
        num1: a,
        num2: b,
        operation: "sats",
        answer: answer,
        formattedText: `${a} + ${b} × ${c} =`,
        subtopic: "BIDMAS (Order of Operations)",
        stepHint: `Multiplication comes first! Calculate ${b} × ${c} = ${b * c}, then add ${a} to get ${answer}.`,
      };
    } else if (subType === 1) {
      // (a - b) x c
      const b = Math.floor(Math.random() * 8) + 3;
      const a = b + Math.floor(Math.random() * 8) + 2;
      const c = Math.floor(Math.random() * 7) + 3;
      const answer = (a - b) * c;
      return {
        num1: a,
        num2: b,
        operation: "sats",
        answer: answer,
        formattedText: `(${a} - ${b}) × ${c} =`,
        subtopic: "BIDMAS Brackets",
        stepHint: `Brackets first! Calculate (${a} - ${b}) = ${a - b}, then multiply by ${c} = ${answer}.`,
      };
    } else {
      // a - b x c
      const b = Math.floor(Math.random() * 5) + 2;
      const c = Math.floor(Math.random() * 6) + 2;
      const product = b * c;
      const a = product + Math.floor(Math.random() * 20) + 5;
      const answer = a - product;
      return {
        num1: a,
        num2: product,
        operation: "sats",
        answer: answer,
        formattedText: `${a} - ${b} × ${c} =`,
        subtopic: "BIDMAS Order of Operations",
        stepHint: `Multiply ${b} × ${c} = ${product} first, then subtract from ${a}: ${a} - ${product} = ${answer}.`,
      };
    }
  } else if (category < 0.5) {
    // Percentages of Amounts
    const pctChoice = [10, 15, 20, 25, 50, 75, 5, 30][Math.floor(Math.random() * 8)];
    const baseAmounts: Record<number, number[]> = {
      10: [40, 70, 120, 240, 350, 600, 850],
      15: [40, 60, 80, 120, 200, 300, 400],
      20: [50, 80, 150, 250, 400, 600],
      25: [40, 60, 80, 120, 160, 200, 400],
      50: [68, 140, 260, 380, 520, 840],
      75: [40, 80, 120, 160, 200, 400],
      5: [60, 80, 120, 200, 300, 400],
      30: [50, 70, 120, 200, 300, 500],
    };
    const pool = baseAmounts[pctChoice];
    const amount = pool[Math.floor(Math.random() * pool.length)];
    const answer = Math.round((pctChoice / 100) * amount);

    let hint = "";
    if (pctChoice === 10) hint = `To find 10%, divide ${amount} by 10 = ${answer}.`;
    else if (pctChoice === 50) hint = `To find 50%, halve ${amount} = ${answer}.`;
    else if (pctChoice === 25) hint = `To find 25%, divide ${amount} by 4 = ${answer}.`;
    else if (pctChoice === 15) hint = `Find 10% (${amount / 10}) + 5% (${amount / 20}) = ${answer}.`;
    else hint = `Calculate (${pctChoice} ÷ 100) × ${amount} = ${answer}.`;

    return {
      num1: pctChoice,
      num2: amount,
      operation: "sats",
      answer: answer,
      formattedText: `${pctChoice}% of ${amount} =`,
      subtopic: "Percentages of Amounts",
      stepHint: hint,
    };
  } else if (category < 0.75) {
    // Fraction Operations (SATs Arithmetic)
    const subF = Math.floor(Math.random() * 3);
    if (subF === 0) {
      // Fraction of a quantity: e.g. 3/4 of 48 = 36 or 2/5 of 45 = 18
      const den = [3, 4, 5, 6, 8][Math.floor(Math.random() * 5)];
      const num = Math.floor(Math.random() * (den - 1)) + 1;
      const multiplier = Math.floor(Math.random() * 8) + 3;
      const total = den * multiplier;
      const answer = num * multiplier;

      return {
        num1: num,
        num2: total,
        operation: "sats",
        answer: answer,
        formattedText: `${num}/${den} of ${total} =`,
        subtopic: "Fractions of Amounts",
        stepHint: `Divide by denominator: ${total} ÷ ${den} = ${multiplier}. Then multiply by numerator: ${multiplier} × ${num} = ${answer}.`,
      };
    } else if (subF === 1) {
      // Fraction addition/subtraction with related denominators
      // e.g. 1/2 + 1/4 = 3/4 or 3/8 + 1/4 = 5/8 (asking for numerator if same den format)
      // Represented as integer answer: e.g. 4.8 + 2.35 or 6 - 2.45
      const a = (Math.floor(Math.random() * 60) + 10) / 10;
      const b = (Math.floor(Math.random() * 40) + 5) / 10;
      const isAdd = Math.random() > 0.5;
      const answer = isAdd ? +(a + b).toFixed(1) : +(a - b).toFixed(1);
      return {
        num1: a,
        num2: b,
        operation: "sats",
        answer: answer,
        formattedText: isAdd ? `${a} + ${b} =` : `${a} - ${b} =`,
        subtopic: "Decimal Arithmetic",
        stepHint: "Line up the decimal points and compute column by column.",
      };
    } else {
      // Multi-digit division: e.g. 840 / 7 = 120 or 960 / 8 = 120 or 504 / 6
      const divisor = Math.floor(Math.random() * 7) + 3;
      const quotient = Math.floor(Math.random() * 80) + 20;
      const dividend = divisor * quotient;
      return {
        num1: dividend,
        num2: divisor,
        operation: "divide",
        answer: quotient,
        formattedText: `${dividend} ÷ ${divisor} =`,
        subtopic: "Short Division (Bus Stop)",
        stepHint: `How many ${divisor}s go into ${dividend}? ${dividend} ÷ ${divisor} = ${quotient}.`,
      };
    }
  } else {
    // Algebra / Missing Variables
    // e.g. 3x + 5 = 26 -> x = 7
    const coeff = Math.floor(Math.random() * 5) + 2;
    const xVal = Math.floor(Math.random() * 9) + 2;
    const constant = Math.floor(Math.random() * 15) + 3;
    const total = coeff * xVal + constant;

    return {
      num1: coeff,
      num2: constant,
      operation: "sats",
      answer: xVal,
      formattedText: `If ${coeff}x + ${constant} = ${total}, what is x?`,
      subtopic: "Linear Algebra Equations",
      stepHint: `Subtract ${constant} from both sides: ${coeff}x = ${total - constant}. Then divide by ${coeff}: x = ${xVal}.`,
    };
  }
}

/**
 * General Question Generator supporting all UK curriculum year stages
 */
export function generateQuestion(
  yearGroup: UkCurriculumYear = "ks2-y4",
  specificTables?: number[],
  includeDivision: boolean = false,
  missingFactor: boolean = false
): QuestionFact {
  // Check for Early Years
  if (yearGroup === "eyfs-nursery" || yearGroup === "eyfs-reception" || yearGroup === "ks1-y1") {
    return generateEyfsQuestion(yearGroup);
  }

  // Check for Year 6 SATs
  if (yearGroup === "ks2-y6" && Math.random() > 0.45) {
    return generateSatsQuestion();
  }

  // Year 5 Special Questions (Primes, Squares, x10/100/1000)
  if (yearGroup === "ks2-y5" && Math.random() < 0.4) {
    const y5type = Math.random();
    if (y5type < 0.5) {
      // Square or Cube numbers
      const isCube = Math.random() > 0.7;
      if (isCube) {
        const base = Math.floor(Math.random() * 5) + 2; // 2, 3, 4, 5
        const ans = base * base * base;
        return {
          num1: base,
          num2: 3,
          operation: "multiply",
          answer: ans,
          formattedText: `${base}³ =`,
          subtopic: "Cube Numbers",
          stepHint: `${base}³ = ${base} × ${base} × ${base} = ${ans}`,
        };
      } else {
        const base = Math.floor(Math.random() * 11) + 2; // 2 to 12
        const ans = base * base;
        return {
          num1: base,
          num2: 2,
          operation: "multiply",
          answer: ans,
          formattedText: `${base}² =`,
          subtopic: "Square Numbers",
          stepHint: `${base}² = ${base} × ${base} = ${ans}`,
        };
      }
    } else {
      // Multiplying by 10, 100, 1000
      const power = [10, 100, 1000][Math.floor(Math.random() * 3)];
      const num = Math.floor(Math.random() * 85) + 12;
      const ans = num * power;
      return {
        num1: num,
        num2: power,
        operation: "multiply",
        answer: ans,
        formattedText: `${num} × ${power} =`,
        subtopic: "Powers of 10",
        stepHint: `Shift digits left by ${Math.log10(power)} places: ${num} × ${power} = ${ans}`,
      };
    }
  }

  // Year 2 & 3 Mental Arithmetic or Times Tables
  const stageInfo = CURRICULUM_STAGES[yearGroup] || CURRICULUM_STAGES["ks2-y4"];
  const allowedTables = specificTables && specificTables.length > 0 
    ? specificTables 
    : (stageInfo.tables || [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);

  const table = allowedTables[Math.floor(Math.random() * allowedTables.length)];
  const multiplier = Math.floor(Math.random() * 12) + 1;

  const isDivision = includeDivision && Math.random() > 0.6;

  if (isDivision) {
    const product = table * multiplier;
    return {
      num1: product,
      num2: table,
      operation: "divide",
      answer: multiplier,
      formattedText: `${product} ÷ ${table} =`,
      table: table,
      subtopic: `${table} Times Table (Division)`,
      stepHint: `Think inverse: what number multiplied by ${table} equals ${product}? It's ${multiplier}!`,
    };
  }

  const swap = Math.random() > 0.5;
  const n1 = swap ? multiplier : table;
  const n2 = swap ? table : multiplier;
  const answer = n1 * n2;

  let text = `${n1} × ${n2} =`;
  if (missingFactor) {
    const hideFirst = Math.random() > 0.5;
    text = hideFirst ? `? × ${n2} = ${answer}` : `${n1} × ? = ${answer}`;
    return {
      num1: n1,
      num2: n2,
      operation: "multiply",
      answer: hideFirst ? n1 : n2,
      formattedText: text,
      table: table,
      subtopic: `${table} Times Table (Missing Factor)`,
    };
  }

  return {
    num1: n1,
    num2: n2,
    operation: "multiply",
    answer: answer,
    formattedText: text,
    table: table,
    subtopic: `${table} Times Table`,
  };
}

/**
 * Generate an authentic 25-question MTC test per UK DfE Framework
 */
export function generateMtcQuestions(): QuestionFact[] {
  const questions: QuestionFact[] = [];
  const usedPairs = new Set<string>();

  while (questions.length < 25) {
    let t: number;
    if (questions.length < 16) {
      t = MTC_HIGH_FREQUENCY[Math.floor(Math.random() * MTC_HIGH_FREQUENCY.length)];
    } else {
      t = Math.floor(Math.random() * 11) + 2; // 2 to 12
    }

    const m = Math.floor(Math.random() * 11) + 2; // 2 to 12
    const key = `${Math.min(t, m)}x${Math.max(t, m)}`;

    if (!usedPairs.has(key) || questions.length > 20) {
      usedPairs.add(key);
      const swap = Math.random() > 0.5;
      const n1 = swap ? m : t;
      const n2 = swap ? t : m;
      questions.push({
        num1: n1,
        num2: n2,
        operation: "multiply",
        answer: n1 * n2,
        formattedText: `${n1} × ${n2} =`,
        table: t,
      });
    }
  }

  return questions;
}

/**
 * Generate a complete printable curriculum test sheet with solution key
 */
export function generatePrintableWorksheet(
  stage: UkCurriculumYear = "ks2-y4",
  questionCount: number = 25,
  includeDivision: boolean = true
): { questions: QuestionFact[]; title: string } {
  const stageInfo = CURRICULUM_STAGES[stage] || CURRICULUM_STAGES["ks2-y4"];
  const list: QuestionFact[] = [];

  for (let i = 0; i < questionCount; i++) {
    list.push(generateQuestion(stage, stageInfo.tables, includeDivision));
  }

  return {
    questions: list,
    title: `${stageInfo.name} Arithmetic & Fluency Test (${stageInfo.ageRange})`,
  };
}

/**
 * Helper to generate 4 sensible multiple-choice options including correct answer
 */
function generateMultipleChoiceOptions(correct: number, min: number, max: number): string[] {
  const opts = new Set<number>([correct]);
  let attempts = 0;
  while (opts.size < 4 && attempts < 30) {
    attempts++;
    const delta = [-2, -1, 1, 2, 3, -3][Math.floor(Math.random() * 6)];
    const candidate = correct + delta;
    if (candidate >= min && candidate <= max && candidate !== correct) {
      opts.add(candidate);
    }
  }
  // If not enough unique, fill with random in range
  while (opts.size < 4) {
    const r = Math.floor(Math.random() * (max - min + 1)) + min;
    opts.add(r);
  }

  const arr = Array.from(opts).map(String);
  // Shuffle
  return arr.sort(() => Math.random() - 0.5);
}

// Speed rank title computation
export function getSpeedRankTitle(avgMs: number): { title: string; badge: string; color: string } {
  if (avgMs <= 0) return { title: "Unranked Cadet", badge: "🛡️", color: "text-gray-400" };
  if (avgMs < 1000) return { title: "Quantum Titan", badge: "⚡👑", color: "text-amber-500 font-extrabold" };
  if (avgMs < 1400) return { title: "Rock Legend", badge: "🎸🔥", color: "text-rose-500 font-bold" };
  if (avgMs < 2000) return { title: "Lightning Champion", badge: "⚡", color: "text-indigo-600 font-bold" };
  if (avgMs < 3000) return { title: "Math Knight", badge: "⚔️", color: "text-blue-600 font-semibold" };
  if (avgMs < 4500) return { title: "Number Apprentice", badge: "📜", color: "text-emerald-600 font-medium" };
  return { title: "Novice Explorer", badge: "🌱", color: "text-slate-600" };
}

