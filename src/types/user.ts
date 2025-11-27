/**
 * User-related type definitions for formula sharing
 */

export interface User {
  userId: string;
  userName: string;
  email: string;
  operatorId: string;
  department?: string;
  role?: string;
}

export interface ShareFormulaRequest {
  formulaId: string;
  sharedWith: string[];    // Array of user IDs to share with
  sharedBy: string;        // Current user ID
  sharedDate: string;      // ISO timestamp
  accessLevel: 'readonly';  // Always readonly for now
}

export interface ShareFormulaResponse {
  success: boolean;
  message: string;
  sharedWith: string[];
}
