import { describe, it, expect } from "vitest";
import {
  normalizeScore,
  calculateCategoryScore,
  calculateFinalGrade,
  type CategoryConfig,
  type GradeItemInput,
  type GradeScaleConfig,
} from "../src/features/gradebook/engine";

describe("Gradebook Calculation Engine", () => {
  const standardScales: GradeScaleConfig[] = [
    { letterGrade: "A", minScore: 85, maxScore: 100, gradePoint: 4.0 },
    { letterGrade: "B+", minScore: 75, maxScore: 84.99, gradePoint: 3.3 },
    { letterGrade: "B", minScore: 70, maxScore: 74.99, gradePoint: 3.0 },
    { letterGrade: "C", minScore: 55, maxScore: 69.99, gradePoint: 2.0 },
    { letterGrade: "D", minScore: 40, maxScore: 54.99, gradePoint: 1.0 },
    { letterGrade: "E", minScore: 0, maxScore: 39.99, gradePoint: 0.0 },
  ];

  it("correctly normalizes item score to 0-100 scale", () => {
    expect(normalizeScore(45, 50)).toBe(90);
    expect(normalizeScore(85, 100)).toBe(85);
    expect(normalizeScore(0, 100)).toBe(0);
    expect(normalizeScore(10, 0)).toBe(0); // edge case: maxScore 0
  });

  it("handles category calculation with average method", () => {
    const cat: CategoryConfig = {
      categoryId: "cat-1",
      name: "Tugas",
      weightPercent: 20,
      aggregationMethod: "average",
    };

    const items: GradeItemInput[] = [
      { itemId: "item-1", categoryId: "cat-1", score: 80, maxScore: 100 },
      { itemId: "item-2", categoryId: "cat-1", score: 90, maxScore: 100 },
    ];

    const result = calculateCategoryScore(cat, items);
    expect(result.scoreNormalized).toBe(85);
    expect(result.isComplete).toBe(true);
    expect(result.gradedItems).toBe(2);
  });

  it("never treats null as 0 by default", () => {
    const cat: CategoryConfig = {
      categoryId: "cat-1",
      name: "Tugas",
      weightPercent: 20,
      aggregationMethod: "average",
    };

    const items: GradeItemInput[] = [
      { itemId: "item-1", categoryId: "cat-1", score: 80, maxScore: 100 },
      { itemId: "item-2", categoryId: "cat-1", score: null, maxScore: 100 }, // Pending
    ];

    const result = calculateCategoryScore(cat, items);
    // Score only averages the graded items (80), NOT (80 + 0)/2 = 40
    expect(result.scoreNormalized).toBe(80);
    expect(result.isComplete).toBe(false);
    expect(result.gradedItems).toBe(1);
    expect(result.totalItems).toBe(2);
  });

  it("validates 0 as a legitimate graded zero score", () => {
    const cat: CategoryConfig = {
      categoryId: "cat-1",
      name: "Tugas",
      weightPercent: 20,
      aggregationMethod: "average",
    };

    const items: GradeItemInput[] = [
      { itemId: "item-1", categoryId: "cat-1", score: 0, maxScore: 100 }, // Legitimate zero
      { itemId: "item-2", categoryId: "cat-1", score: 80, maxScore: 100 },
    ];

    const result = calculateCategoryScore(cat, items);
    // (0 + 80) / 2 = 40
    expect(result.scoreNormalized).toBe(40);
    expect(result.isComplete).toBe(true);
  });

  it("calculates weighted final grade correctly when all categories are complete", () => {
    const categories: CategoryConfig[] = [
      { categoryId: "c1", name: "Tugas", weightPercent: 20, aggregationMethod: "average" },
      { categoryId: "c2", name: "UTS", weightPercent: 30, aggregationMethod: "average" },
      { categoryId: "c3", name: "UAS", weightPercent: 50, aggregationMethod: "average" },
    ];

    const items: GradeItemInput[] = [
      { itemId: "i1", categoryId: "c1", score: 80, maxScore: 100 },
      { itemId: "i2", categoryId: "c2", score: 90, maxScore: 100 },
      { itemId: "i3", categoryId: "c3", score: 85, maxScore: 100 },
    ];

    // Expected final: (80*0.2) + (90*0.3) + (85*0.5) = 16 + 27 + 42.5 = 85.5
    const result = calculateFinalGrade(categories, items, standardScales);
    expect(result.finalScore).toBe(85.5);
    expect(result.letterGrade).toBe("A");
    expect(result.gradePoint).toBe(4.0);
    expect(result.isReadyForFinalization).toBe(true);
    expect(result.uncompletedCategories.length).toBe(0);
  });

  it("prevents finalization if total weight is not 100%", () => {
    const categories: CategoryConfig[] = [
      { categoryId: "c1", name: "Tugas", weightPercent: 20, aggregationMethod: "average" },
      { categoryId: "c2", name: "UTS", weightPercent: 30, aggregationMethod: "average" },
      // Sum = 50%, missing 50%
    ];

    const items: GradeItemInput[] = [
      { itemId: "i1", categoryId: "c1", score: 80, maxScore: 100 },
      { itemId: "i2", categoryId: "c2", score: 90, maxScore: 100 },
    ];

    const result = calculateFinalGrade(categories, items, standardScales);
    expect(result.totalActiveWeight).toBe(50);
    expect(result.isReadyForFinalization).toBe(false);
  });

  it("reports uncompleted categories when some categories have no grades", () => {
    const categories: CategoryConfig[] = [
      { categoryId: "c1", name: "Tugas", weightPercent: 30, aggregationMethod: "average" },
      { categoryId: "c2", name: "UAS", weightPercent: 70, aggregationMethod: "average" },
    ];

    const items: GradeItemInput[] = [
      { itemId: "i1", categoryId: "c1", score: 90, maxScore: 100 },
      // UAS has no graded items at all
      { itemId: "i2", categoryId: "c2", score: null, maxScore: 100 },
    ];

    const result = calculateFinalGrade(categories, items, standardScales);
    expect(result.isReadyForFinalization).toBe(false);
    expect(result.uncompletedCategories).toContain("UAS");
  });
});
