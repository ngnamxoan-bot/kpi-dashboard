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
  // Media Key
  { name: "Helia",    group: "Media Key" },
  { name: "Clara",    group: "Media Key" },
  { name: "Daniel",   group: "Media Key" },
  { name: "Heidi",    group: "Media Key" },
  { name: "Barry",    group: "Media Key" },
  { name: "Alex",     group: "Media Key" },
  { name: "Ocean",    group: "Media Key" },
  { name: "Titus",    group: "Media Key" },
  { name: "Leon Le",  group: "Media Key" },
  { name: "Mio",      group: "Media Key" },
  { name: "Julie",    group: "Media Key" },
  { name: "Sean",     group: "Media Key" },
  { name: "Sherry",   group: "Media Key" },
  { name: "Charlie",  group: "Media Key" },
  { name: "Nancy",    group: "Media Key" },
  { name: "Nathan",   group: "Media Key" },
  { name: "Yollie",   group: "Media Key" },
  // Media CTV
  { name: "My",       group: "Media CTV" },
  { name: "Vi",       group: "Media CTV" },
  { name: "Nah",      group: "Media CTV" },
  { name: "Uri",      group: "Media CTV" },
  { name: "Q.Anh",    group: "Media CTV" },
  { name: "Phat",     group: "Media CTV" },
  { name: "Henri",    group: "Media CTV" },
  { name: "Meran",    group: "Media CTV" },
];

// Default tasks (sample data for seeding — dùng nhân sự thực tế)
export const DEFAULT_TASKS = [
  { title: "Post Design (Static)",   assignee: "Barry",   project: "Holiday Project", package: "Standard" },
  { title: "Post Design (Static)",   assignee: "Mio",     project: "Holiday Project", package: "Standard" },
  { title: "Post Design (Static)",   assignee: "Clara",   project: "Holiday Project", package: "Standard" },
  { title: "Story Design",           assignee: "Helia",   project: "Holiday Project", package: "Basic" },
  { title: "Banner/Cover",           assignee: "Daniel",  project: "Client X",        package: "Premium" },
  { title: "Post Design (Animated)", assignee: "Titus",   project: "Client Y",        package: "Premium" },
  { title: "Post Design (Static)",   assignee: "Alex",    project: "Client Z",        package: "Standard" },
  { title: "Story Design",           assignee: "Ocean",   project: "Holiday Project", package: "Basic" },
  { title: "Post Design (Static)",   assignee: "Heidi",   project: "Client X",        package: "Standard" },
  { title: "Post Design (Static)",   assignee: "Leon Le", project: "Client Y",        package: "Standard" },
  { title: "Banner/Cover",           assignee: "Julie",   project: "Client Z",        package: "Premium" },
  { title: "Post Design (Static)",   assignee: "Nathan",  project: "Holiday Project", package: "Standard" },
  { title: "Story Design",           assignee: "My",      project: "Client X",        package: "Basic" },
  { title: "Story Design",           assignee: "Vi",      project: "Client X",        package: "Basic" },
  { title: "Story Design",           assignee: "Nah",     project: "Client Y",        package: "Basic" },
  { title: "Story Design",           assignee: "Uri",     project: "Client Y",        package: "Basic" },
  { title: "Story Design",           assignee: "Q.Anh",   project: "Client Z",        package: "Basic" },
  { title: "Story Design",           assignee: "Phat",    project: "Client Z",        package: "Basic" },
  { title: "Story Design",           assignee: "Henri",   project: "Holiday Project", package: "Basic" },
  { title: "Story Design",           assignee: "Meran",   project: "Holiday Project", package: "Basic" },
];

// Default manager inputs (bonus/penalty/quality/attitude per designer)
export const DEFAULT_MANAGER_INPUTS = {
  Helia:    { bonus: 0, penalty: 0, qualityScore: 7.5, attitudeScore: 8.0 },
  Clara:    { bonus: 0, penalty: 0, qualityScore: 7.5, attitudeScore: 8.0 },
  Daniel:   { bonus: 0, penalty: 0, qualityScore: 7.0, attitudeScore: 7.5 },
  Heidi:    { bonus: 0, penalty: 0, qualityScore: 7.5, attitudeScore: 8.0 },
  Barry:    { bonus: 0, penalty: 0, qualityScore: 7.5, attitudeScore: 8.0 },
  Alex:     { bonus: 0, penalty: 0, qualityScore: 7.0, attitudeScore: 7.5 },
  Ocean:    { bonus: 0, penalty: 0, qualityScore: 7.5, attitudeScore: 8.0 },
  Titus:    { bonus: 0, penalty: 0, qualityScore: 8.0, attitudeScore: 8.5 },
  "Leon Le":{ bonus: 0, penalty: 0, qualityScore: 7.5, attitudeScore: 7.5 },
  Mio:      { bonus: 0, penalty: 0, qualityScore: 8.0, attitudeScore: 8.5 },
  Julie:    { bonus: 0, penalty: 0, qualityScore: 7.5, attitudeScore: 8.0 },
  Sean:     { bonus: 0, penalty: 0, qualityScore: 7.5, attitudeScore: 7.5 },
  Sherry:   { bonus: 0, penalty: 0, qualityScore: 9.0, attitudeScore: 9.0 },
  Charlie:  { bonus: 0, penalty: 0, qualityScore: 8.0, attitudeScore: 8.5 },
  Nancy:    { bonus: 0, penalty: 0, qualityScore: 9.0, attitudeScore: 9.0 },
  Nathan:   { bonus: 0, penalty: 0, qualityScore: 7.5, attitudeScore: 7.5 },
  Yollie:   { bonus: 0, penalty: 0, qualityScore: 7.0, attitudeScore: 7.0 },
  My:       { bonus: 0, penalty: 0, qualityScore: 7.0, attitudeScore: 7.0 },
  Vi:       { bonus: 0, penalty: 0, qualityScore: 7.5, attitudeScore: 7.5 },
  Nah:      { bonus: 0, penalty: 0, qualityScore: 7.0, attitudeScore: 7.0 },
  Uri:      { bonus: 0, penalty: 0, qualityScore: 7.5, attitudeScore: 7.5 },
  "Q.Anh":  { bonus: 0, penalty: 0, qualityScore: 7.0, attitudeScore: 7.0 },
  Phat:     { bonus: 0, penalty: 0, qualityScore: 7.5, attitudeScore: 7.5 },
  Henri:    { bonus: 0, penalty: 0, qualityScore: 7.0, attitudeScore: 7.5 },
  Meran:    { bonus: 0, penalty: 0, qualityScore: 7.5, attitudeScore: 8.0 },
};
