import { describe, it, expect } from "vitest";
import {
  normalizeScore,
  calculateCategoryScore,
  calculateFinalGrade,
  type CategoryConfig,
  type GradeItemInput,
  type GradeScaleConfig,
} from "../src/features/gradebook/engine";

describe("Phase 3 Gradebook Formula & Edge Cases Tests", () => {
  const scales: GradeScaleConfig[] = [
    { letterGrade: "A", minScore: 85, maxScore: 100, gradePoint: 4.0 },
    { letterGrade: "A-", minScore: 80, maxScore: 84.99, gradePoint: 3.7 },
    { letterGrade: "B+", minScore: 75, maxScore: 79.99, gradePoint: 3.3 },
    { letterGrade: "B", minScore: 70, maxScore: 74.99, gradePoint: 3.0 },
    { letterGrade: "C", minScore: 55, maxScore: 69.99, gradePoint: 2.0 },
    { letterGrade: "D", minScore: 40, maxScore: 54.99, gradePoint: 1.0 },
    { letterGrade: "E", minScore: 0, maxScore: 39.99, gradePoint: 0.0 },
  ];

  it("handles sum_normalized aggregation method correctly", () => {
    const cat: CategoryConfig = {
      categoryId: "cat-sum",
      name: "Tugas Mandiri",
      weightPercent: 30,
      aggregationMethod: "sum_normalized",
    };

    // Item 1: 40/50, Item 2: 80/100 -> Total = 120 / 150 = 80%
    const items: GradeItemInput[] = [
      { itemId: "it-1", categoryId: "cat-sum", score: 40, maxScore: 50 },
      { itemId: "it-2", categoryId: "cat-sum", score: 80, maxScore: 100 },
    ];

    const result = calculateCategoryScore(cat, items);
    expect(result.scoreNormalized).toBe(80);
  });

  it("distinguishes legitimate score of 0 from null (unassessed)", () => {
    const cat: CategoryConfig = {
      categoryId: "cat-zero",
      name: "Kuis",
      weightPercent: 20,
      aggregationMethod: "average",
    };

    // Case A: 1 item graded 0, 1 item null
    const itemsWithZeroAndNull: GradeItemInput[] = [
      { itemId: "k-1", categoryId: "cat-zero", score: 0, maxScore: 100 },
      { itemId: "k-2", categoryId: "cat-zero", score: null, maxScore: 100 },
    ];

    const resA = calculateCategoryScore(cat, itemsWithZeroAndNull);
    // Only item 1 is graded (0), so category score is 0, but incomplete!
    expect(resA.scoreNormalized).toBe(0);
    expect(resA.isComplete).toBe(false);
    expect(resA.gradedItems).toBe(1);

    // Case B: 1 item graded 100, 1 item null
    const itemsWithScoreAndNull: GradeItemInput[] = [
      { itemId: "k-1", categoryId: "cat-zero", score: 100, maxScore: 100 },
      { itemId: "k-2", categoryId: "cat-zero", score: null, maxScore: 100 },
    ];

    const resB = calculateCategoryScore(cat, itemsWithScoreAndNull);
    // Score is 100 (from item 1), NOT dragged down to 50!
    expect(resB.scoreNormalized).toBe(100);
    expect(resB.isComplete).toBe(false);
  });

  it("matches manual benchmark calculation with 6 weighted categories", () => {
    // 6 Categories from SOT:
    // Presensi: 10%, Tugas: 20%, Kuis: 15%, Praktikum: 15%, UTS: 20%, UAS: 20% = 100%
    const categories: CategoryConfig[] = [
      { categoryId: "c-att", name: "Presensi", weightPercent: 10, aggregationMethod: "average" },
      { categoryId: "c-asg", name: "Tugas", weightPercent: 20, aggregationMethod: "average" },
      { categoryId: "c-qz", name: "Kuis", weightPercent: 15, aggregationMethod: "average" },
      { categoryId: "c-prk", name: "Praktikum", weightPercent: 15, aggregationMethod: "average" },
      { categoryId: "c-uts", name: "UTS", weightPercent: 20, aggregationMethod: "average" },
      { categoryId: "c-uas", name: "UAS", weightPercent: 20, aggregationMethod: "average" },
    ];

    const items: GradeItemInput[] = [
      { itemId: "1", categoryId: "c-att", score: 100, maxScore: 100 }, // 100 * 0.10 = 10
      { itemId: "2", categoryId: "c-asg", score: 85, maxScore: 100 },  // 85 * 0.20 = 17
      { itemId: "3", categoryId: "c-qz", score: 80, maxScore: 100 },   // 80 * 0.15 = 12
      { itemId: "4", categoryId: "c-prk", score: 90, maxScore: 100 },  // 90 * 0.15 = 13.5
      { itemId: "5", categoryId: "c-uts", score: 80, maxScore: 100 },  // 80 * 0.20 = 16
      { itemId: "6", categoryId: "c-uas", score: 85, maxScore: 100 },  // 85 * 0.20 = 17
    ];
    // Expected Sum = 10 + 17 + 12 + 13.5 + 16 + 17 = 85.5 -> Grade A

    const res = calculateFinalGrade(categories, items, scales);
    expect(res.finalScore).toBe(85.5);
    expect(res.letterGrade).toBe("A");
    expect(res.gradePoint).toBe(4.0);
    expect(res.isReadyForFinalization).toBe(true);
  });
});
