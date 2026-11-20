import type { MlResult } from './ml';

export function resultSummary(result: MlResult): string {
  return result.summary || result.headline || 'Assessment complete.';
}

export function resultIndicator(result: MlResult): string {
  return result.overallIndicator || 'green';
}

export function sanitizeResult(result: MlResult): MlResult {
  return {
    ...result,
    summary: resultSummary(result),
    overallIndicator: resultIndicator(result) as MlResult['overallIndicator'],
  };
}
