// Default month key/label
export const DEFAULT_MONTH_KEY = "2024-06";
export const DEFAULT_MONTH_LABEL = "Tháng 6/2024";

// Default KPI config
export const DEFAULT_CONFIG = {
  weights: {
    taskScore: 0.5,
    qualityScore: 0.25,
    attitudeScore: 0.25,
  },
  coefficients: {
    "Basic": 1.0,
    "Standard": 1.2,
    "Premium": 1.5,
    "Enterprise": 1.8,
  },
  hsDefault: 1.0,
  hsMin: 0.5,
  hsMax: 2.0,
  taskTarget: 40,
  managerPassword: "macmedia123",
};

// Default task catalog
export const DEFAULT_CATALOG = [
  { name: "Post Design (Static)",      type: "design",  points: 2.0, base: "per post" },
  { name: "Post Design (Animated)",    type: "design",  points: 3.0, base: "per post" },
  { name: "Story Design",              type: "design",  points: 1.5, base: "per story" },
  { name: "Banner/Cover",              type: "design",  points: 2.5, base: "per banner" },
  { name: "Brand Identity Element",    type: "design",  points: 5.0, base: "per item" },
  { name: "Video Editing (Short)",     type: "video",   points: 4.0, base: "per video" },
  { name: "Video Editing (Long)",      type: "video",   points: 8.0, base: "per video" },
  { name: "Reels/TikTok",             type: "video",   points: 3.0, base: "per reel" },
  { name: "Copywriting (Caption)",     type: "content", points: 1.5, base: "per post" },
  { name: "Copywriting (Article)",     type: "content", points: 4.0, base: "per article" },
  { name: "Strategy/Planning",        type: "strategy",points: 6.0, base: "per plan" },
  { name: "Consultation/Meeting",     type: "other",   points: 2.0, base: "per hour" },
  { name: "Report",                   type: "other",   points: 3.0, base: "per report" },
];

// Default designers list
export const DEFAULT_DESIGNERS = [
  { name: "Barry",   group: "Creative" },
  { name: "Anna",    group: "Creative" },
  { name: "Tom",     group: "Creative" },
  { name: "Sophie",  group: "Creative" },
  { name: "Leo",     group: "Media Key" },
  { name: "Mia",     group: "Media Key" },
  { name: "Nathan",  group: "Media Key" },
  { name: "Kimmy",   group: "Media Key" },
];

// Default tasks (sample data for seeding)
export const DEFAULT_TASKS = [
  { title: "Post Design (Static)",   assignee: "Barry",  project: "Client A", package: "Standard" },
  { title: "Post Design (Static)",   assignee: "Barry",  project: "Client A", package: "Standard" },
  { title: "Post Design (Animated)", assignee: "Barry",  project: "Client B", package: "Premium" },
  { title: "Story Design",           assignee: "Anna",   project: "Client A", package: "Basic" },
  { title: "Banner/Cover",           assignee: "Anna",   project: "Client C", package: "Standard" },
  { title: "Video Editing (Short)",  assignee: "Tom",    project: "Client B", package: "Premium" },
  { title: "Reels/TikTok",          assignee: "Tom",    project: "Client D", package: "Basic" },
  { title: "Copywriting (Caption)",  assignee: "Sophie", project: "Client A", package: "Basic" },
  { title: "Strategy/Planning",     assignee: "Sophie", project: "Client C", package: "Enterprise" },
  { title: "Post Design (Static)",   assignee: "Leo",    project: "Client D", package: "Standard" },
  { title: "Video Editing (Long)",   assignee: "Leo",    project: "Client B", package: "Premium" },
  { title: "Post Design (Animated)", assignee: "Mia",    project: "Client A", package: "Standard" },
  { title: "Story Design",           assignee: "Mia",    project: "Client D", package: "Basic" },
  { title: "Banner/Cover",           assignee: "Nathan", project: "Client C", package: "Standard" },
  { title: "Reels/TikTok",          assignee: "Nathan", project: "Client B", package: "Premium" },
  { title: "Post Design (Static)",   assignee: "Kimmy",  project: "Client A", package: "Basic" },
  { title: "Copywriting (Article)",  assignee: "Kimmy",  project: "Client C", package: "Standard" },
];

// Default manager inputs (bonus/penalty/quality/attitude per designer)
export const DEFAULT_MANAGER_INPUTS = {
  Barry:   { bonus: 0, penalty: 0, qualityScore: 8.5, attitudeScore: 9.0 },
  Anna:    { bonus: 0, penalty: 0, qualityScore: 8.0, attitudeScore: 8.5 },
  Tom:     { bonus: 0, penalty: 0, qualityScore: 7.5, attitudeScore: 8.0 },
  Sophie:  { bonus: 0, penalty: 0, qualityScore: 9.0, attitudeScore: 9.5 },
  Leo:     { bonus: 0, penalty: 0, qualityScore: 8.0, attitudeScore: 8.0 },
  Mia:     { bonus: 0, penalty: 0, qualityScore: 7.0, attitudeScore: 7.5 },
  Nathan:  { bonus: 0, penalty: 0, qualityScore: 8.5, attitudeScore: 8.0 },
  Kimmy:   { bonus: 0, penalty: 0, qualityScore: 8.0, attitudeScore: 8.0 },
};
