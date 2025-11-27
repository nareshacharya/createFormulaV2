/**
 * useFormulaSharing Hook
 * Custom hook to handle formula sharing logic and state
 */

import { useState, useCallback } from 'react';
import { UserService } from '../services/userService';
import type { Formula } from '../services/pega';

export interface FormulaShareState {
  isShareModalOpen: boolean;
  selectedFormula: Formula | null;
}

export const useFormulaSharing = () => {
  const [shareState, setShareState] = useState<FormulaShareState>({
    isShareModalOpen: false,
    selectedFormula: null
  });

  /**
   * Open share modal for a specific formula
   */
  const openShareModal = useCallback((formula: Formula) => {
    setShareState({
      isShareModalOpen: true,
      selectedFormula: formula
    });
  }, []);

  /**
   * Close share modal
   */
  const closeShareModal = useCallback(() => {
    setShareState({
      isShareModalOpen: false,
      selectedFormula: null
    });
  }, []);

  /**
   * Share formula with selected users
   */
  const shareFormula = useCallback(async (formulaId: string, userIds: string[]) => {
    const request = {
      formulaId,
      sharedWith: userIds,
      sharedBy: UserService.getCurrentUserId(),
      sharedDate: new Date().toISOString(),
      accessLevel: 'readonly' as const
    };

    const response = await UserService.shareFormula(request);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to share formula');
    }

    return response;
  }, []);

  /**
   * Check if current user owns a formula
   */
  const isFormulaOwner = useCallback((formula: Formula): boolean => {
    const currentUserId = UserService.getCurrentUserId();
    return formula.createdBy === currentUserId || formula.sharedBy === currentUserId;
  }, []);

  /**
   * Check if formula is shared with current user (read-only access)
   */
  const isSharedWithMe = useCallback((formula: Formula): boolean => {
    const currentUserId = UserService.getCurrentUserId();
    return !!(formula.sharedWith?.includes(currentUserId) && !isFormulaOwner(formula));
  }, [isFormulaOwner]);

  /**
   * Check if formula can be edited by current user
   */
  const canEditFormula = useCallback((formula: Formula): boolean => {
    // Owners and draft formulas can be edited
    if (isFormulaOwner(formula) || formula.status === 'draft') {
      return true;
    }
    
    // Shared formulas are read-only
    if (formula.isReadOnly || isSharedWithMe(formula)) {
      return false;
    }

    return true;
  }, [isFormulaOwner, isSharedWithMe]);

  /**
   * Get share status text for a formula
   */
  const getShareStatusText = useCallback((formula: Formula): string | null => {
    if (isSharedWithMe(formula)) {
      return `Shared by ${formula.sharedBy || 'another user'} - Read Only`;
    }
    
    if (formula.isShared && formula.sharedWith && formula.sharedWith.length > 0) {
      return `Shared with ${formula.sharedWith.length} user${formula.sharedWith.length !== 1 ? 's' : ''}`;
    }

    return null;
  }, [isSharedWithMe]);

  return {
    shareState,
    openShareModal,
    closeShareModal,
    shareFormula,
    isFormulaOwner,
    isSharedWithMe,
    canEditFormula,
    getShareStatusText
  };
};
