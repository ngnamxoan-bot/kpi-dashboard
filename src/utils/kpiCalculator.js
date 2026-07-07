/**
 * Core KPI calculation engine.
 * All scores are 0-10 scale unless noted.
 */

export function calculateKPI(designers, tasks, managerInputs, catalog, config) {
  const {
    weights = { taskScore: 0.5, qualityScore: 0.25, attitudeScore: 0.25 },
    coefficients = {},
    hsDefault = 1.0,
    hsMin = 0.5,
    hsMax = 2.0,
    taskTarget = 40,
  } = config;

  // Build catalog map: taskTitle -> { points }
  const catalogMap = {};
  for (const item of catalog) {
    catalogMap[item.name] = item;
  }

  // Group tasks by assignee
  const tasksByAssignee = {};
  for (const t of tasks) {
    if (!tasksByAssignee[t.assignee]) tasksByAssignee[t.assignee] = [];
    tasksByAssignee[t.assignee].push(t);
  }

  const results = [];

  for (const designer of designers) {
    const name = designer.name;
    const myTasks = tasksByAssignee[name] || [];
    const mi = managerInputs[name] || { bonus: 0, penalty: 0, qualityScore: 7, attitudeScore: 7 };

    // Calculate raw task points
    let rawPoints = 0;
    for (const task of myTasks) {
      const catalogEntry = catalogMap[task.title];
      const basePoints = catalogEntry ? catalogEntry.points : 2.0;
      const hs = clamp(coefficients[task.package] ?? hsDefault, hsMin, hsMax);
      rawPoints += basePoints * hs;
    }

    // Normalize task score to 0-10 based on target
    // taskTarget represents "expected" raw points for a 10/10
    const taskPointsTarget = taskTarget * (coefficients["Standard"] ?? 1.0) * 2.0;
    const rawTaskScore = Math.min(10, (rawPoints / Math.max(taskPointsTarget, 1)) * 10);

    // Apply bonus/penalty (in points, then convert to score delta)
    const bonusDelta = (mi.bonus || 0) / Math.max(taskPointsTarget, 1) * 10;
    const penaltyDelta = (mi.penalty || 0) / Math.max(taskPointsTarget, 1) * 10;
    const adjustedTaskScore = clamp(rawTaskScore + bonusDelta - penaltyDelta, 0, 10);

    const qualityScore = clamp(Number(mi.qualityScore) || 0, 0, 10);
    const attitudeScore = clamp(Number(mi.attitudeScore) || 0, 0, 10);

    const finalScore =
      adjustedTaskScore * weights.taskScore +
      qualityScore * weights.qualityScore +
      attitudeScore * weights.attitudeScore;

    const finalRounded = Math.round(finalScore * 100) / 100;

    results.push({
      name,
      group: designer.group,
      taskCount: myTasks.length,
      rawPoints: Math.round(rawPoints * 10) / 10,
      taskScore: Math.round(adjustedTaskScore * 100) / 100,
      qualityScore,
      attitudeScore,
      bonus: mi.bonus || 0,
      penalty: mi.penalty || 0,
      finalScore: finalRounded,
      status: getStatus(finalRounded),
      tasks: myTasks,
    });
  }

  // Sort by finalScore descending
  results.sort((a, b) => b.finalScore - a.finalScore);

  return results;
}

function clamp(val, min, max) {
  return Math.min(max, Math.max(min, val));
}

export function getStatus(score) {
  if (score >= 9) return "good";
  if (score >= 7) return "pass";
  if (score >= 5) return "near";
  return "fail";
}

export function getStatusLabel(status) {
  const labels = { good: "Xuất sắc", pass: "Đạt", near: "Gần đạt", fail: "Chưa đạt" };
  return labels[status] || status;
}

export function getStatusBadgeClass(status) {
  const classes = { good: "badge badge-good", pass: "badge badge-pass", near: "badge badge-near", fail: "badge badge-fail" };
  return classes[status] || "badge badge-near";
}
