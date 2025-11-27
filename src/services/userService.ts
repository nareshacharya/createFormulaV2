/**
 * User Service for managing user data and sharing
 * Uses mock data until Pega Data Page is available
 */

import type { User, ShareFormulaRequest, ShareFormulaResponse } from '../types/user';

// Mock user data - to be replaced with Pega Data Page
const MOCK_USERS: User[] = [
  {
    userId: 'user001',
    userName: 'Alice Johnson',
    email: 'alice.johnson@company.com',
    operatorId: 'AJ001',
    department: 'R&D',
    role: 'Senior Perfumer'
  },
  {
    userId: 'user002',
    userName: 'Bob Smith',
    email: 'bob.smith@company.com',
    operatorId: 'BS002',
    department: 'Quality Control',
    role: 'QC Manager'
  },
  {
    userId: 'user003',
    userName: 'Carol Martinez',
    email: 'carol.martinez@company.com',
    operatorId: 'CM003',
    department: 'R&D',
    role: 'Junior Perfumer'
  },
  {
    userId: 'user004',
    userName: 'David Lee',
    email: 'david.lee@company.com',
    operatorId: 'DL004',
    department: 'Production',
    role: 'Production Manager'
  },
  {
    userId: 'user005',
    userName: 'Emma Wilson',
    email: 'emma.wilson@company.com',
    operatorId: 'EW005',
    department: 'R&D',
    role: 'Perfumer'
  },
  {
    userId: 'user006',
    userName: 'Frank Chen',
    email: 'frank.chen@company.com',
    operatorId: 'FC006',
    department: 'Regulatory',
    role: 'Regulatory Specialist'
  },
  {
    userId: 'user007',
    userName: 'Grace Taylor',
    email: 'grace.taylor@company.com',
    operatorId: 'GT007',
    department: 'R&D',
    role: 'Senior Perfumer'
  },
  {
    userId: 'user008',
    userName: 'Henry Brown',
    email: 'henry.brown@company.com',
    operatorId: 'HB008',
    department: 'Marketing',
    role: 'Product Manager'
  }
];

// Cache for user list
let cachedUsers: User[] | null = null;
let cacheTimestamp: number | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export class UserService {
  /**
   * Get list of all users from Pega Data Page
   * Currently returns mock data - replace with actual API call
   */
  static async getUserList(): Promise<User[]> {
    // Check cache
    const now = Date.now();
    if (cachedUsers && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
      return Promise.resolve(cachedUsers);
    }

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // TODO: Replace with actual Pega Data Page call
    // const response = await PegaAPI.getDataPage('D_UserList');
    // return response.data;

    // Cache and return mock data
    cachedUsers = MOCK_USERS;
    cacheTimestamp = now;
    return MOCK_USERS;
  }

  /**
   * Share a formula with selected users
   */
  static async shareFormula(request: ShareFormulaRequest): Promise<ShareFormulaResponse> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // TODO: Replace with actual Pega REST API call
    // const response = await PegaAPI.post('/formulas/share', request);
    // return response.data;

    // Mock success response
    console.log('Sharing formula:', request);
    
    return {
      success: true,
      message: `Formula shared successfully with ${request.sharedWith.length} user(s)`,
      sharedWith: request.sharedWith
    };
  }

  /**
   * Unshare a formula from selected users
   */
  static async unshareFormula(formulaId: string, userIds: string[]): Promise<ShareFormulaResponse> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // TODO: Replace with actual Pega REST API call
    // const response = await PegaAPI.post('/formulas/unshare', { formulaId, userIds });
    // return response.data;

    // Mock success response
    console.log('Unsharing formula:', { formulaId, userIds });
    
    return {
      success: true,
      message: `Formula access revoked for ${userIds.length} user(s)`,
      sharedWith: []
    };
  }

  /**
   * Get current user ID (mock implementation)
   * TODO: Replace with actual user context from Pega
   */
  static getCurrentUserId(): string {
    // In real implementation, get from Pega user context
    return 'current_user';
  }

  /**
   * Clear user cache
   */
  static clearCache(): void {
    cachedUsers = null;
    cacheTimestamp = null;
  }
}
