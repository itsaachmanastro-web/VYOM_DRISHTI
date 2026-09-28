/**
 * VYOM DRISHTI AI — Dataset & Model Training Lab Types
 * Scientist-Friendly No-Code ML Retraining System
 */

export type ProblemType = 'CLASSIFICATION' | 'REGRESSION';

export interface ColumnSchema {
  name: string;
  dataType: 'NUMERICAL' | 'CATEGORICAL' | 'DATETIME' | 'BOOLEAN' | 'TEXT';
  inferredRole: 'FEATURE' | 'TARGET_CANDIDATE' | 'IDENTIFIER' | 'IGNORE';
  missingCount: number;
  missingPercentage: number;
  uniqueCount: number;
  sampleValues: (string | number)[];
  mean?: number;
  median?: number;
  stdDev?: number;
  min?: number;
  max?: number;
  iqrOutliersCount?: number;
}

export interface DatasetOverview {
  id: string;
  name: string;
  uploadedAt: string;
  fileSizeBytes: number;
  rowCount: number;
  columnCount: number;
  columns: ColumnSchema[];
  targetColumn: string | null;
  problemType: ProblemType;
  rawPreview: Record<string, any>[];
}

export interface DataQualityBreakdownItem {
  category: 'MISSING_VALUES' | 'DUPLICATES' | 'CLASS_BALANCE' | 'OUTLIERS' | 'INVALID_VALUES' | 'FEATURE_CONSISTENCY';
  name: string;
  status: 'EXCELLENT' | 'GOOD' | 'WARNING' | 'CRITICAL';
  score: number; // 0 to 100
  details: string;
}

export interface DataQualityReport {
  overallScore: number; // 0 to 100
  rating: 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'POOR';
  items: DataQualityBreakdownItem[];
  duplicateRowCount: number;
  constantColumnCount: number;
  highCardinalityColumnCount: number;
  summaryText: string;
}

export interface CorrelationPair {
  featureA: string;
  featureB: string;
  coefficient: number; // -1.0 to +1.0
}

export interface EDASummary {
  numericalFeatureStats: {
    columnName: string;
    mean: number;
    median: number;
    stdDev: number;
    min: number;
    max: number;
    q25: number;
    q75: number;
    outlierCount: number;
  }[];
  categoricalDistributions: {
    columnName: string;
    distribution: { label: string; count: number; percentage: number }[];
  }[];
  targetDistribution: {
    label: string;
    count: number;
    percentage: number;
  }[];
  correlationMatrix: CorrelationPair[];
  isClassImbalanced: boolean;
  classImbalanceRatio: string;
  imbalanceAdvice: string;
}

export interface PreprocessingStep {
  id: string;
  title: string;
  description: string;
  status: 'APPLIED' | 'PLANNED' | 'SKIPPED';
  affectedColumns: string[];
  rationale: string;
}

export interface PreprocessingPlan {
  trainRowCount: number;
  valRowCount: number;
  testRowCount: number;
  splitStrategy: 'STRATIFIED_RANDOM' | 'TIME_AWARE' | 'RANDOM_SPLIT';
  trainSplitRatio: number; // e.g. 0.70
  valSplitRatio: number; // e.g. 0.15
  testSplitRatio: number; // e.g. 0.15
  steps: PreprocessingStep[];
  engineeredFeatures: { name: string; formula: string; explanation: string }[];
  leakageProtectionVerified: boolean;
}

export type ModelAlgorithm = 
  | 'LOGISTIC_REGRESSION'
  | 'DECISION_TREE'
  | 'RANDOM_FOREST'
  | 'GRADIENT_BOOSTING'
  | 'EDGE_NEURAL_NETWORK';

export interface ModelTrainingConfig {
  mode: 'STANDARD' | 'EXPERT';
  targetColumn: string;
  selectedFeatures: string[];
  selectedAlgorithms: ModelAlgorithm[];
  autoFeatureEngineering: boolean;
  handleClassImbalance: boolean;
  imbalanceStrategy: 'CLASS_WEIGHTS' | 'RANDOM_OVERSAMPLING' | 'NONE';
  crossValidationFolds: number; // default 5
  hyperparameters?: Record<string, any>;
}

export interface ConfusionMatrixData {
  classLabels: string[];
  matrix: number[][]; // [trueLabelIndex][predictedLabelIndex]
  totalSamples: number;
}

export interface FeatureImportanceItem {
  featureName: string;
  importanceScore: number; // 0.0 to 1.0 (normalized)
  rank: number;
}

export interface CrossValidationResult {
  folds: number;
  foldScores: number[]; // F1 per fold
  meanScore: number;
  stdDev: number;
  metricName: string;
}

export interface ModelEvaluationMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc: number;
  overallScore: number;
  trainingTimeMs: number;
  inferenceLatencyMs: number;
  confusionMatrix: ConfusionMatrixData;
  featureImportance: FeatureImportanceItem[];
  crossValidation: CrossValidationResult;
}

export interface ModelComparisonRow {
  modelId: string;
  algorithmName: string;
  algorithmKey: ModelAlgorithm;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc: number;
  trainingTimeMs: number;
  inferenceLatencyMs: number;
  isBestCandidate: boolean;
}

export interface ModelRegistryItem {
  version: string; // e.g. "v1.0-BASE", "v1.1-CANDIDATE"
  status: 'ACTIVE' | 'CANDIDATE' | 'ARCHIVED' | 'FAILED_VALIDATION';
  createdAt: string;
  algorithm: string;
  datasetName: string;
  datasetVersion: string;
  f1Score: number;
  accuracy: number;
  precision: number;
  recall: number;
  rocAuc: number;
  featureCount: number;
  sampleCount: number;
  author: string;
  description: string;
}

export interface DataDriftFeatureItem {
  featureName: string;
  driftStatus: 'STABLE' | 'MODERATE_DRIFT' | 'SIGNIFICANT_DRIFT';
  psiScore: number; // Population Stability Index
  baselineMean: number;
  newDatasetMean: number;
  deltaPercent: number;
  explanation: string;
}

export interface DataDriftReport {
  overallDriftStatus: 'LOW' | 'MODERATE' | 'HIGH';
  baselineDatasetName: string;
  newDatasetName: string;
  analyzedFeaturesCount: number;
  driftedFeaturesCount: number;
  targetDriftDetected: boolean;
  featureDriftItems: DataDriftFeatureItem[];
  recommendation: string;
}

export interface TrainingStageProgress {
  stage: 'IDLE' | 'VALIDATING_DATA' | 'FEATURE_PREPARATION' | 'PREPROCESSING' | 'TRAINING_BASELINE' | 'TRAINING_CANDIDATES' | 'CROSS_VALIDATION' | 'EVALUATION' | 'SAVING_MODEL' | 'COMPLETED' | 'ERROR';
  progressPercent: number;
  currentMessage: string;
  currentAlgorithm?: string;
  error?: string;
}
