import { describe, expect, it } from 'vitest';
import {
  getCategory,
  getOption,
  indicatorFromWeightedAverage,
  questionBank,
} from './index';

describe('question bank', () => {
  it('covers all eight required behaviour areas', () => {
    expect(questionBank.categories).toHaveLength(8);
    const ids = questionBank.categories.map((category) => category.id);
    expect(ids).toEqual([
      'communication',
      'honesty',
      'trust',
      'boundaries',
      'accountability',
      'support',
      'control',
      'conflict',
    ]);
  });

  it('has unique question and option ids with valid categories', () => {
    const questionIds = questionBank.questions.map((question) => question.id);
    expect(new Set(questionIds).size).toBe(questionIds.length);

    for (const question of questionBank.questions) {
      expect(getCategory(question.category)).toBeDefined();
      expect(question.hint.length).toBeGreaterThan(0);
      const optionIds = question.options.map((option) => option.id);
      expect(new Set(optionIds).size).toBe(optionIds.length);
      for (const option of question.options) {
        expect(option.weight).toBeGreaterThanOrEqual(0);
        expect(option.weight).toBeLessThanOrEqual(3);
      }
    }
  });

  it('resolves options by question and option id', () => {
    expect(getOption('q-boundaries-1', 'c')?.weight).toBe(3);
    expect(getOption('q-boundaries-1', 'missing')).toBeUndefined();
  });
});

describe('indicator mapping', () => {
  it('maps weighted averages to qualitative indicators', () => {
    expect(indicatorFromWeightedAverage(0.8)).toBe('green');
    expect(indicatorFromWeightedAverage(1.6)).toBe('yellow');
    expect(indicatorFromWeightedAverage(2.7)).toBe('red');
  });
});
