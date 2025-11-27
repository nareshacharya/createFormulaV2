/**
 * ShareFormulaModal Component
 * Modal for sharing formulas with other users
 */

import { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import Modal from './Modal';
import Button from './Button';
import { UserService } from '../services/userService';
import type { User } from '../types/user';
import type { Formula } from '../services/pega';

interface ShareFormulaModalProps {
  isOpen: boolean;
  onClose: () => void;
  formula: Formula | null;
  onShare: (formulaId: string, userIds: string[]) => void;
}

const ShareFormulaModal = ({
  isOpen,
  onClose,
  formula,
  onShare
}: ShareFormulaModalProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // Load users when modal opens
  useEffect(() => {
    if (isOpen) {
      loadUsers();
      // Pre-select already shared users
      if (formula?.sharedWith) {
        setSelectedUsers(new Set(formula.sharedWith));
      } else {
        setSelectedUsers(new Set());
      }
      setSearchQuery('');
    }
  }, [isOpen, formula]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const userList = await UserService.getUserList();
      setUsers(userList);
    } catch (error) {
      toast.error('Failed to load users');
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    
    const query = searchQuery.toLowerCase();
    return users.filter(user =>
      user.userName.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.operatorId.toLowerCase().includes(query) ||
      user.department?.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const handleShare = async () => {
    if (!formula) return;
    
    if (selectedUsers.size === 0) {
      toast.error('Please select at least one user to share with');
      return;
    }

    setIsSharing(true);
    try {
      const userIds = Array.from(selectedUsers);
      await onShare(formula.id, userIds);
      toast.success(`Formula shared with ${userIds.length} user(s)`);
      onClose();
    } catch (error) {
      toast.error('Failed to share formula');
      console.error('Error sharing formula:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const handleClose = () => {
    if (!isSharing) {
      setSelectedUsers(new Set());
      setSearchQuery('');
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Share Formula: ${formula?.name || ''}`}
      size="lg"
    >
      <div className="flex flex-col h-full max-h-[600px]">
        {/* Search Input */}
        <div className="mb-4">
          <div className="relative">
            <span className="material-symbols-rounded absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
              search
            </span>
            <input
              type="text"
              placeholder="Search users by name, email, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Selected Count */}
        {selectedUsers.size > 0 && (
          <div className="mb-3 flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
            <span className="material-symbols-rounded text-sm">
              people
            </span>
            <span className="font-medium">
              {selectedUsers.size} user{selectedUsers.size !== 1 ? 's' : ''} selected
            </span>
          </div>
        )}

        {/* User List */}
        <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="text-gray-500">Loading users...</div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-500">
              <span className="material-symbols-rounded text-4xl mb-2">
                person_search
              </span>
              <div>No users found</div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredUsers.map((user) => {
                const isSelected = selectedUsers.has(user.userId);
                
                return (
                  <label
                    key={user.userId}
                    className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleUserSelection(user.userId)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {user.userName}
                        </span>
                        <span className="text-xs text-gray-500 font-mono">
                          {user.operatorId}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 truncate">
                        {user.email}
                      </div>
                      {user.department && (
                        <div className="text-xs text-gray-500 mt-0.5">
                          {user.department}
                          {user.role && ` • ${user.role}`}
                        </div>
                      )}
                    </div>
                    {isSelected && (
                      <span className="material-symbols-rounded text-blue-600 text-sm">
                        check_circle
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSharing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleShare}
            disabled={isSharing || selectedUsers.size === 0}
          >
            {isSharing ? (
              <>
                <span className="material-symbols-rounded animate-spin text-sm mr-2">
                  progress_activity
                </span>
                Sharing...
              </>
            ) : (
              <>
                <span className="material-symbols-rounded text-sm mr-2">
                  share
                </span>
                Share with {selectedUsers.size} user{selectedUsers.size !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ShareFormulaModal;
