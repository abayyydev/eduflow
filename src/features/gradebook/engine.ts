export interface GradeItemInput {
  itemId: string;
  categoryId: string;
  score: number | null; // null = not graded yet, 0 = valid 0
  maxScore: number;
}

export interface CategoryConfig {
  categoryId: string;
  name: string;
  weightPercent: number; // e.g. 20 for 20%
  aggregationMethod: "average" | "sum_normalized" | "manual";
  isRequired?: boolean;
}

export interface GradeScaleConfig {
  letterGrade: string;
  minScore: number;
  maxScore: number;
  gradePoint?: number | null;
}

export interface CalculatedCategory {
  categoryId: string;
  name: string;
  weightPercent: number;
  scoreNormalized: number | null; // null if no graded items in category
  totalItems: number;
  gradedItems: number;
  isComplete: boolean;
}

export interface FinalGradeResult {
  categories: CalculatedCategory[];
  finalScore: number | null; // null if required category has no score or zero weighted score
  letterGrade: string | null;
  gradePoint: number | null;
  totalActiveWeight: number; // sum of weights
  isReadyForFinalization: boolean;
  uncompletedCategories: string[];
}

/**
 * Normalizes an item score to a 0-100 scale.
 * score / maxScore * 100
 */
export function normalizeScore(score: number, maxScore: number): number {
  if (maxScore <= 0) return 0;
  const normalized = (score / maxScore) * 100;
  return Math.round(normalized * 100) / 100;
}

/**
 * Aggregates item scores inside a single category according to aggregation method.
 */
export function calculateCategoryScore(
  category: CategoryConfig,
  items: GradeItemInput[]
): CalculatedCategory {
  const categoryItems = items.filter((i) => i.categoryId === category.categoryId);
  const gradedItems = categoryItems.filter((i) => i.score !== null && !isNaN(i.score as number));

  let scoreNormalized: number | null = null;

  if (gradedItems.length > 0) {
    if (category.aggregationMethod === "sum_normalized") {
      const totalScore = gradedItems.reduce((acc, curr) => acc + (curr.score as number), 0);
      const totalMax = gradedItems.reduce((acc, curr) => acc + curr.maxScore, 0);
      scoreNormalized = totalMax > 0 ? (totalScore / totalMax) * 100 : 0;
    } else {
      // Default: 'average' of normalized items
      const sumNormalized = gradedItems.reduce(
        (acc, curr) => acc + normalizeScore(curr.score as number, curr.maxScore),
        0
      );
      scoreNormalized = sumNormalized / gradedItems.length;
    }
    scoreNormalized = Math.round(scoreNormalized * 100) / 100;
  }

  const isComplete =
    categoryItems.length > 0
      ? gradedItems.length === categoryItems.length
      : false;

  return {
    categoryId: category.categoryId,
    name: category.name,
    weightPercent: category.weightPercent,
    scoreNormalized,
    totalItems: categoryItems.length,
    gradedItems: gradedItems.length,
    isComplete,
  };
}

/**
 * Calculates student final score from category scores and weights.
 *
 * Formula:
 * Σ(category_score * category_weight) / Σ(calculated_category_weight)
 *
 * Empty values (null) are NOT treated as zero.
 */
export function calculateFinalGrade(
  categoriesConfig: CategoryConfig[],
  items: GradeItemInput[],
  scales: GradeScaleConfig[],
  options?: { treatEmptyAsZero?: boolean }
): FinalGradeResult {
  const totalActiveWeight = categoriesConfig.reduce(
    (acc, curr) => acc + curr.weightPercent,
    0
  );

  const calculatedCategories: CalculatedCategory[] = categoriesConfig.map((cat) =>
    calculateCategoryScore(cat, items)
  );

  const uncompletedCategories: string[] = [];
  let weightedScoreSum = 0;
  let calculatedWeightSum = 0;

  for (const cat of calculatedCategories) {
    let effectiveScore = cat.scoreNormalized;

    if (effectiveScore === null) {
      if (options?.treatEmptyAsZero) {
        effectiveScore = 0;
      } else {
        uncompletedCategories.push(cat.name);
        continue;
      }
    }

    weightedScoreSum += (effectiveScore * cat.weightPercent) / 100;
    calculatedWeightSum += cat.weightPercent;
  }

  let finalScore: number | null = null;
  if (calculatedWeightSum > 0) {
    // Proportional calculation if some categories are pending, or total if all counted
    const scoreVal = (weightedScoreSum / calculatedWeightSum) * 100;
    finalScore = Math.round(scoreVal * 100) / 100;
  }

  // Determine letter grade from scales
  let letterGrade: string | null = null;
  let gradePoint: number | null = null;

  if (finalScore !== null && scales.length > 0) {
    const matchedScale = scales.find(
      (s) => finalScore! >= s.minScore && finalScore! <= s.maxScore
    );
    if (matchedScale) {
      letterGrade = matchedScale.letterGrade;
      gradePoint = matchedScale.gradePoint ?? null;
    }
  }

  const isReadyForFinalization =
    Math.abs(totalActiveWeight - 100) < 0.01 &&
    uncompletedCategories.length === 0 &&
    finalScore !== null;

  return {
    categories: calculatedCategories,
    finalScore,
    letterGrade,
    gradePoint,
    totalActiveWeight: Math.round(totalActiveWeight * 100) / 100,
    isReadyForFinalization,
    uncompletedCategories,
  };
}
