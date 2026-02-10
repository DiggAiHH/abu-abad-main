/**
 * @module ProjectTypes
 * @description Typen für das Projekt-Tracking Dashboard
 * @version 1.0.0
 * @since 2026-02-09
 * @audit DSGVO-konform — keine personenbezogenen Daten in diesen Typen
 */

export type WorkPackageStatus = 'completed' | 'in-progress' | 'planned' | 'blocked';
export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type RiskLevel = 'high' | 'medium' | 'low';

export interface Milestone {
  readonly id: string;
  readonly title: string;
  readonly date: string;
  readonly status: WorkPackageStatus;
  readonly description: string;
}

export interface Risk {
  readonly id: string;
  readonly title: string;
  readonly level: RiskLevel;
  readonly mitigation: string;
  readonly status: 'active' | 'mitigated' | 'accepted';
}

export interface Task {
  readonly id: string;
  readonly title: string;
  readonly status: WorkPackageStatus;
  readonly assignee?: string;
  readonly dueDate?: string;
  readonly description?: string;
}

export interface WorkPackage {
  readonly id: string;
  readonly wpNumber: string;
  readonly title: string;
  readonly description: string;
  readonly status: WorkPackageStatus;
  readonly progress: number;
  readonly priority: Priority;
  readonly startDate: string;
  readonly endDate: string;
  readonly budget?: number;
  readonly spent?: number;
  readonly responsible: string;
  readonly tasks: readonly Task[];
  readonly milestones: readonly Milestone[];
  readonly risks: readonly Risk[];
  readonly dependencies: readonly string[];
  readonly tags: readonly string[];
}

export interface ProjectSummary {
  readonly totalWorkPackages: number;
  readonly completedWorkPackages: number;
  readonly inProgressWorkPackages: number;
  readonly plannedWorkPackages: number;
  readonly blockedWorkPackages: number;
  readonly overallProgress: number;
  readonly totalBudget: number;
  readonly totalSpent: number;
  readonly totalMilestones: number;
  readonly completedMilestones: number;
  readonly activeRisks: number;
}

export interface RegulatoryStatus {
  readonly classification: string;
  readonly complianceLevel: string;
  readonly lastAudit?: string;
  readonly nextAudit?: string;
  readonly openFindings: number;
  readonly certifications: readonly string[];
}
