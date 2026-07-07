/**
 * Calculates points for a single task based on its title and the catalog config.
 * 
 * @param {string} title 
 * @param {Array} catalog 
 * @param {number} dailyPostPoints 
 * @returns {number}
 */
export function calculateTaskPoints(title, catalog, dailyPostPoints = 1.0) {
  if (!title) return dailyPostPoints;
  
  const cleanTitle = title.trim();

  // 1. Exact match
  const exactMatch = catalog.find(item => item.type === cleanTitle);
  if (exactMatch) {
    return exactMatch.points;
  }

  // 2. Prefix match (A2 starts with catalog base name)
  let maxPrefixPoints = 0;
  let hasPrefixMatch = false;

  for (const item of catalog) {
    if (item.base && cleanTitle.startsWith(item.base)) {
      if (item.points > maxPrefixPoints) {
        maxPrefixPoints = item.points;
        hasPrefixMatch = true;
      }
    }
  }

  if (hasPrefixMatch) {
    return maxPrefixPoints;
  }

  // 3. Fallback to Daily Post Points (1.0 in June 2026)
  return dailyPostPoints;
}

/**
 * Gets the category of a single task based on its title and the catalog config.
 * 
 * @param {string} title 
 * @param {Array} catalog 
 * @returns {string}
 */
export function getTaskCategory(title, catalog) {
  if (!title) return "Khác";
  const cleanTitle = title.trim();

  // 1. Exact match
  const exactMatch = catalog.find(item => item.type === cleanTitle);
  if (exactMatch) {
    return exactMatch.category || "Khác";
  }

  // 2. Prefix match
  for (const item of catalog) {
    if (item.base && cleanTitle.startsWith(item.base)) {
      return item.category || "Khác";
    }
  }

  return "Khác";
}

/**
 * Calculates the KPI scorecard for all designers.
 * 
 * @param {Array} designers - List of designers [{name, group}]
 * @param {Array} tasks - List of tasks [{title, assignee, project, package, points}]
 * @param {Object} managerInputs - Map of designerName -> {quality, lateTasks, lateDays, bonus, bonusNotes}
 * @param {Object} config - KPI parameters and weights
 * @param {Array} catalog - Catalog mapping
 * @returns {Array} List of designer scorecards with calculations
 */
export function calculateKPI(designers, tasks, managerInputs, config, catalog) {
  const {
    weights,
    targetPoints,
    warningThreshold,
    coefficients,
    hsMin,
    hsMax,
    hsDefault,
    penaltyTask,
    penaltyDay,
    dailyPostPoints
  } = config;

  const scorecards = designers.map(designer => {
    const dName = designer.name;
    const dInputs = managerInputs[dName] || { quality: null, lateTasks: 0, lateDays: 0, bonus: 0, bonusNotes: "" };

    // Filter designer tasks
    const dTasks = tasks.filter(t => t.assignee === dName);
    const totalTasks = dTasks.length;

    // Calculate raw points for each task and sum
    let totalPointsTho = 0;
    const taskDetails = dTasks.map(t => {
      const calculatedPoints = calculateTaskPoints(t.title, catalog, dailyPostPoints);
      const category = getTaskCategory(t.title, catalog);
      totalPointsTho += calculatedPoints;
      return {
        ...t,
        calculatedPoints,
        category
      };
    });

    // Package counts
    const packageCounts = {
      PROX5: 0,
      PROX4: 0,
      PROX3: 0,
      SEM: 0,
      SE1: 0,
      SE0: 0,
      E0: 0,
      KHAC: 0
    };

    dTasks.forEach(t => {
      if (t.package && packageCounts[t.package] !== undefined) {
        packageCounts[t.package]++;
      }
    });

    const daPhanLoaiGoi = Object.values(packageCounts).reduce((a, b) => a + b, 0);

    // Average difficulty coefficient
    let avgDifficultyCoefficient = 0.0;
    if (totalTasks > 0) {
      let sumCoefficients = 0;
      Object.keys(packageCounts).forEach(pkg => {
        const count = packageCounts[pkg];
        const coeff = coefficients[pkg] !== undefined ? coefficients[pkg] : hsDefault;
        sumCoefficients += count * coeff;
      });
      // Add default coefficient for unclassified packages
      sumCoefficients += (totalTasks - daPhanLoaiGoi) * hsDefault;
      avgDifficultyCoefficient = sumCoefficients / totalTasks;
    }

    // Points calculations
    // 1. Quantity score
    const diemSoLuong = Math.min(totalPointsTho / targetPoints, 1.0) * weights.quantity;

    // 2. Difficulty score
    let diemDoKho = 0.0;
    if (totalTasks > 0) {
      const normDiff = (avgDifficultyCoefficient - hsMin) / (hsMax - hsMin);
      diemDoKho = Math.max(0, Math.min(1, normDiff)) * weights.difficulty;
    }

    // 3. Quality score (remains null if unevaluated)
    const qualityVal = dInputs.quality;
    const diemChatLuong = (qualityVal !== null && qualityVal !== undefined && qualityVal !== "")
      ? (Number(qualityVal) / 3.0) * weights.quality
      : null;

    // 4. Bonus/Late score
    const bonusCapped = Math.min(Number(dInputs.bonus || 0), weights.bonus);
    const penalties = (Number(dInputs.lateTasks || 0) * penaltyTask) + (Number(dInputs.lateDays || 0) * penaltyDay);
    const diemBonusTre = bonusCapped + penalties;

    // Total KPI score
    const qualityContribution = diemChatLuong !== null ? diemChatLuong : 0.0;
    const tongDiemKpi = diemSoLuong + diemDoKho + qualityContribution + diemBonusTre;

    // Status Determination
    let trangThai = "❌ Chưa đạt";
    if (designer.group === "Media Key") {
      if (tongDiemKpi >= 70.0) {
        trangThai = "🌟 Good";
      } else if (tongDiemKpi >= 65.0) {
        trangThai = "✅ Đạt";
      } else if (tongDiemKpi >= 50.0) {
        trangThai = "⚠️ Gần đạt";
      } else {
        trangThai = "❌ Chưa đạt";
      }
    } else if (designer.group === "Media CTV") {
      if (tongDiemKpi >= 40.0) {
        trangThai = "✅ Đạt";
      } else {
        trangThai = "❌ Chưa đạt";
      }
    }

    return {
      designerName: dName,
      group: designer.group,
      totalTasks,
      totalPointsTho,
      packageCounts,
      daPhanLoaiGoi,
      avgDifficultyCoefficient,
      diemSoLuong,
      diemDoKho,
      qualityRating: qualityVal,
      diemChatLuong,
      lateTasks: dInputs.lateTasks,
      lateDays: dInputs.lateDays,
      bonusScore: dInputs.bonus,
      bonusNotes: dInputs.bonusNotes,
      diemBonusTre,
      tongDiemKpi,
      trangThai,
      tasks: taskDetails
    };
  });

  // Calculate Ranks
  // Sort by tongDiemKpi descending, then by name ascending for stable sort
  const sorted = [...scorecards].sort((a, b) => {
    if (b.tongDiemKpi !== a.tongDiemKpi) {
      return b.tongDiemKpi - a.tongDiemKpi;
    }
    return a.designerName.localeCompare(b.designerName);
  });

  // Assign Rank
  const ranksMap = {};
  let currentRank = 1;
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i].tongDiemKpi < sorted[i - 1].tongDiemKpi) {
      currentRank = i + 1;
    }
    ranksMap[sorted[i].designerName] = currentRank;
  }

  return scorecards.map(sc => ({
    ...sc,
    rank: ranksMap[sc.designerName]
  }));
}
