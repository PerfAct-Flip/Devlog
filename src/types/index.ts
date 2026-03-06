// ENUMS / UNION TYPES
export type ProjectStatus = "Idea" | "Building" | "Shipped" | "Paused";

export type ResourceCategory =
  | "Article"
  | "Video"
  | "Docs"
  | "Course"
  | "Other";

// CORE DATA MODELS
export interface Tag {
  id: string;
  name: string;
  createdAt: Date;
}

export interface Entry {
  id: string;
  title: string;
  date: Date;
  body: string;
  createdAt: Date;
  updatedAt: Date;
  tags: Tag[];
  projects?: Project[];
  resources?: Resource[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  liveUrl?: string | null;
  repoUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
  tags: Tag[];
  entries?: Entry[];
  resources?: Resource[];
}

export interface Resource {
  id: string;
  url: string;
  title: string;
  category: ResourceCategory;
  notes?: string | null;
  isRead: boolean;
  isFavourite: boolean;
  createdAt: Date;
  updatedAt: Date;
  entryId?: string | null;
  projectId?: string | null;
  entry?: Entry | null;
  project?: Project | null;
  tags: Tag[];
}

// DASHBOARD / COMPUTED SHAPES
export interface WeeklyActivity {
  week: string;
  count: number;
}

export interface TopTag {
  name: string;
  count: number;
}

export interface DashboardStats {
  totalEntries: number;
  totalProjects: number;
  totalResources: number;
  currentStreak: number;
  weeklyActivity: WeeklyActivity[];
  topTags: TopTag[];
}

// API RESPONSE SHAPES
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}