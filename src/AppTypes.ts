export enum AppRole {
  Admin = 'ADMIN',
  Teacher = 'TEACHER',
  Student = 'STUDENT',
}

export enum AppScreen {
  Profile = 'profile',
  JoinBattle = 'join_battle',
  AllForAll = 'all_for_all',
  Achievements = 'achievements',
}

export enum TeacherScreen {
  Dashboard = 'dashboard',
  BattleManager = 'battle_manager',
  StudentList = 'student_list',
  Profile = 'profile',
  AllForAll = 'all_for_all',
  Rewards = 'rewards'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: AppRole | string;
  avatar?: string;
}

export type Student = User;
export type Screen = AppScreen;

export interface CustomModule {
  id: string;
  name: string;
  icon: string;
  role: AppRole;
}

export interface AuthData {
  role: AppRole;
  name?: string;
  userId?: string;
  imageUrl?: string;
  subjects?: string[];
  skills?: string[];
  cycles?: string[];
}