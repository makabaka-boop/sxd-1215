import type {
  GameResult,
  ReviewSuggestion,
  ReviewCategory,
  ReviewSummary,
  MistakeType,
} from '../types';

const generateId = (): string => Math.random().toString(36).slice(2, 11);

const SUGGESTION_TEMPLATES: Record<ReviewCategory, Array<{ title: string; descriptions: string[]; icon: string }>> = {
  accuracy: [
    {
      title: '提升分拣准确率',
      descriptions: [
        '注意核对行李航班号与对应登机口',
        '分拣前仔细确认航班信息',
        '保持专注，减少粗心错分',
        '慢一点，准一点',
      ],
      icon: 'target',
    },
  ],
  overweight_speed: [
    {
      title: '加快超重行李处理',
      descriptions: [
        '超重行李优先处理',
        '看到超重警报立即响应',
        '练习超重行李操作流程',
        '建立超重处理条件反射',
      ],
      icon: 'gauge',
    },
  ],
  gate_change: [
    {
      title: '重视登机口变更确认',
      descriptions: [
        '登机口变更后第一时间确认',
        '看到变更弹窗立即点击确认',
        '变更后分拣前确认新登机口',
        '培养确认按钮位置肌肉记忆',
      ],
      icon: 'arrow-left-right',
    },
  ],
  boarding: [
    {
      title: '提高截载完成率',
      descriptions: [
        '注意航班截载倒计时',
        '优先处理即将截载的航班',
        '截载前清理积压行李',
        '关注截载预警提示',
      ],
      icon: 'plane-takeoff',
    },
  ],
  time_management: [
    {
      title: '优化时间管理',
      descriptions: [
        '加快整体操作节奏',
        '减少不必要的停顿',
        '保持稳定的分拣速度',
        '提前预判行李流向',
      ],
      icon: 'timer',
    },
  ],
  mistake_reduction: [
    {
      title: '减少失误次数',
      descriptions: [
        '从错误中学习',
        '避免重复犯错',
        '每一次失误都是进步机会',
        '保持冷静，减少慌乱出错',
      ],
      icon: 'alert-circle',
    },
  ],
};

const MISTAKE_TYPE_CATEGORY: Record<MistakeType, ReviewCategory> = {
  wrong_channel: 'accuracy',
  overweight_ignored: 'overweight_speed',
  missed_boarding: 'boarding',
  security_failed: 'accuracy',
  baggage_expired: 'time_management',
  gate_change_unconfirmed: 'gate_change',
};

const WEAKNESS_LABELS: Record<ReviewCategory, string> = {
  accuracy: '分拣准确率',
  overweight_speed: '超重处理速度',
  gate_change: '登机口变更处理',
  boarding: '截载响应',
  time_management: '时间管理',
  mistake_reduction: '失误控制',
};

interface AnalysisResult {
  category: ReviewCategory;
  score: number;
  priority: 'high' | 'medium' | 'low';
}

function analyzeResult(result: GameResult): AnalysisResult[] {
  const { breakdown, mistakes, overweightHandles, gateChangeHandles, boardingCompletions } = result;

  const analyses: AnalysisResult[] = [];

  const accuracyRate = breakdown.accuracy.max > 0 ? breakdown.accuracy.rate : 0;
  if (accuracyRate < 0.85) {
    analyses.push({
      category: 'accuracy',
      score: accuracyRate,
      priority: accuracyRate < 0.6 ? 'high' : accuracyRate < 0.75 ? 'medium' : 'low',
    });
  }

  if (overweightHandles.length > 0) {
    const avgSpeed = breakdown.overweight.avgSpeed;
    if (avgSpeed > 4000) {
      analyses.push({
        category: 'overweight_speed',
        score: Math.max(0, 1 - avgSpeed / 10000),
        priority: avgSpeed > 7000 ? 'high' : avgSpeed > 5000 ? 'medium' : 'low',
      });
    }
  }

  if (gateChangeHandles.length > 0) {
    const confirmRate = breakdown.gateChange.confirmRate;
    const unconfirmedTotal = gateChangeHandles.reduce((sum, h) => sum + h.unconfirmedMistakes, 0);
    if (confirmRate < 1 || unconfirmedTotal > 0) {
      const score = confirmRate * (1 - Math.min(1, unconfirmedTotal / 5));
      analyses.push({
        category: 'gate_change',
        score,
        priority: confirmRate < 0.6 || unconfirmedTotal > 2 ? 'high' : confirmRate < 0.85 || unconfirmedTotal > 0 ? 'medium' : 'low',
      });
    }
  }

  if (boardingCompletions.length > 0) {
    const completeRate = breakdown.boarding.completeRate;
    if (completeRate < 0.9) {
      analyses.push({
        category: 'boarding',
        score: completeRate,
        priority: completeRate < 0.6 ? 'high' : completeRate < 0.8 ? 'medium' : 'low',
      });
    }
  }

  const remainingRatio = breakdown.timeBonus.max > 0
    ? breakdown.timeBonus.remaining / (breakdown.timeBonus.max * 5)
    : 0;
  if (remainingRatio < 0.15) {
    analyses.push({
      category: 'time_management',
      score: remainingRatio,
      priority: remainingRatio < 0.05 ? 'high' : 'medium',
    });
  }

  const mistakeCount = mistakes.length;
  if (mistakeCount > 2) {
    analyses.push({
      category: 'mistake_reduction',
      score: Math.max(0, 1 - mistakeCount / 10),
      priority: mistakeCount > 5 ? 'high' : mistakeCount > 3 ? 'medium' : 'low',
    });
  }

  return analyses.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return a.score - b.score;
  });
}

function createSuggestion(analysis: AnalysisResult): ReviewSuggestion {
  const templates = SUGGESTION_TEMPLATES[analysis.category];
  const template = templates[Math.floor(Math.random() * templates.length)];
  const description = template.descriptions[Math.floor(Math.random() * template.descriptions.length)];

  return {
    id: generateId(),
    category: analysis.category,
    title: template.title,
    description,
    priority: analysis.priority,
    icon: template.icon,
  };
}

function getTopWeakness(analyses: AnalysisResult[]): string {
  if (analyses.length === 0) return '整体表现优秀，继续保持！';
  const top = analyses[0];
  return WEAKNESS_LABELS[top.category];
}

function getTopImprovement(analyses: AnalysisResult[], result: GameResult): string {
  if (analyses.length === 0) {
    if (result.grade === 'S' || result.grade === 'A') {
      return '挑战更高难度关卡';
    }
    return '保持当前状态，争取更高评级';
  }

  const top = analyses[0];
  const suggestions = SUGGESTION_TEMPLATES[top.category][0];
  return suggestions.title;
}

export function generateReviewSuggestions(result: GameResult): ReviewSuggestion[] {
  const analyses = analyzeResult(result);
  return analyses.slice(0, 4).map(createSuggestion);
}

export function generateReviewSummary(result: GameResult): ReviewSummary {
  const suggestions = generateReviewSuggestions(result);
  const analyses = analyzeResult(result);

  const accuracyRate = result.breakdown.accuracy.max > 0
    ? Math.round(result.breakdown.accuracy.rate * 100)
    : 100;
  const avgOverweightSpeed = Math.round(result.breakdown.overweight.avgSpeed);
  const gateChangeConfirmRate = result.gateChangeHandles.length > 0
    ? Math.round(result.breakdown.gateChange.confirmRate * 100)
    : 100;
  const boardingCompleteRate = result.boardingCompletions.length > 0
    ? Math.round(result.breakdown.boarding.completeRate * 100)
    : 100;
  const mistakeCount = result.mistakes.length;
  const remainingTime = result.breakdown.timeBonus.remaining;

  const mistakeCategories = new Set(
    result.mistakes
      .map(m => MISTAKE_TYPE_CATEGORY[m.type])
  );

  if (mistakeCategories.size > 0) {
    for (const cat of mistakeCategories) {
      if (!analyses.find(a => a.category === cat)) {
        analyses.push({
          category: cat,
          score: 0.7,
          priority: 'low',
        });
      }
    }
  }

  analyses.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return a.score - b.score;
  });

  return {
    levelId: result.levelId,
    score: result.totalScore,
    grade: result.grade,
    timestamp: result.timestamp,
    suggestions,
    topWeakness: getTopWeakness(analyses),
    topImprovement: getTopImprovement(analyses, result),
    keyStats: {
      accuracyRate,
      avgOverweightSpeed,
      gateChangeConfirmRate,
      boardingCompleteRate,
      mistakeCount,
      remainingTime,
    },
  };
}

export function getPriorityColor(priority: 'high' | 'medium' | 'low'): string {
  switch (priority) {
    case 'high': return 'text-red-400';
    case 'medium': return 'text-amber-400';
    case 'low': return 'text-blue-400';
  }
}

export function getPriorityBgColor(priority: 'high' | 'medium' | 'low'): string {
  switch (priority) {
    case 'high': return 'bg-red-500/20 border-red-500/40';
    case 'medium': return 'bg-amber-500/20 border-amber-500/40';
    case 'low': return 'bg-blue-500/20 border-blue-500/40';
  }
}

export function getPriorityDotColor(priority: 'high' | 'medium' | 'low'): string {
  switch (priority) {
    case 'high': return 'bg-red-500';
    case 'medium': return 'bg-amber-500';
    case 'low': return 'bg-blue-500';
  }
}

export function getIconComponent(iconName: string): string {
  return iconName;
}
