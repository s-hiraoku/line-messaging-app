'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, User, X } from 'lucide-react';

interface UserSelectorProps {
  value?: string;
  onValueChange: (lineUserId: string) => void;
  placeholder?: string;
}

interface User {
  id: string;
  lineUserId: string;
  displayName: string;
  pictureUrl: string | null;
  isFollowing: boolean;
  createdAt: string;
  lastMessageAt: string | null;
}

export function UserSelector({
  value,
  onValueChange,
  placeholder = 'ユーザーを検索...'
}: UserSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load initial user if value is provided
  useEffect(() => {
    if (value && !selectedUser) {
      fetchUserById(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Fetch user by lineUserId
  const fetchUserById = async (lineUserId: string) => {
    try {
      const response = await fetch(`/api/users?q=${encodeURIComponent(lineUserId)}`);
      if (response.ok) {
        const data = await response.json();
        const user = data.items.find((u: User) => u.lineUserId === lineUserId);
        if (user) {
          setSelectedUser(user);
        }
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  };

  // Fetch users with debounce
  const fetchUsers = useCallback(async (query: string) => {
    if (!query.trim()) {
      setUsers([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/users?q=${encodeURIComponent(query)}&take=10`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.items || []);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle search input change with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsOpen(true);

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      fetchUsers(value);
    }, 300);
  };

  // Handle user selection
  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setSearchTerm('');
    setIsOpen(false);
    setUsers([]);
    onValueChange(user.lineUserId);
  };

  // Handle clear selection
  const handleClear = () => {
    setSelectedUser(null);
    setSearchTerm('');
    setUsers([]);
    inputRef.current?.focus();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup debounce timeout
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative w-full">
      {/* Selected user display */}
      {selectedUser ? (
        <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300">
          <div className="flex items-center gap-2 min-w-0">
            {selectedUser.pictureUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={selectedUser.pictureUrl}
                alt={selectedUser.displayName}
                className="h-8 w-8 rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e8f5e9]">
                <User className="h-4 w-4 text-gray-700" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-gray-800 truncate">{selectedUser.displayName}</p>
              <p className="text-xs font-mono text-gray-500 truncate">{selectedUser.lineUserId}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="ml-2 flex-shrink-0 rounded-lg bg-white p-1 shadow-[inset_0_-4px_12px_rgba(0,0,0,0.04),inset_0_2px_6px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 text-gray-700 transition-all duration-300"
            aria-label="選択を解除"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <>
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={() => {
                setIsOpen(true);
                if (searchTerm) fetchUsers(searchTerm);
              }}
              className="w-full rounded-xl bg-white pl-10 pr-3 py-2 text-sm font-mono text-gray-800 placeholder-gray-400 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)] focus:shadow-[inset_0_-6px_16px_rgba(0,0,0,0.06),inset_0_3px_8px_rgba(255,255,255,0.9),0_12px_32px_rgba(0,0,0,0.12)] focus:outline-none transition-all duration-300"
              placeholder={placeholder}
            />
          </div>

          {/* Dropdown */}
          {isOpen && (
            <div
              ref={dropdownRef}
              className="absolute z-10 mt-2 w-full rounded-xl bg-white shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)] max-h-60 overflow-auto transition-all duration-300"
            >
              {loading ? (
                <div className="px-3 py-2 text-sm font-mono text-gray-500 text-center">
                  読み込み中...
                </div>
              ) : users.length > 0 ? (
                <ul className="py-1">
                  {users.map((user) => (
                    <li key={user.id}>
                      <button
                        type="button"
                        onClick={() => handleSelectUser(user)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left rounded-lg hover:bg-[#e8f5e9] transition-all duration-300"
                      >
                        {user.pictureUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={user.pictureUrl}
                            alt={user.displayName}
                            className="h-8 w-8 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e8f5e9]">
                            <User className="h-4 w-4 text-gray-700" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-gray-800 truncate">{user.displayName}</p>
                          <p className="text-xs font-mono text-gray-500 truncate">{user.lineUserId}</p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : searchTerm ? (
                <div className="px-3 py-2 text-sm font-mono text-gray-500 text-center">
                  ユーザーが見つかりませんでした
                </div>
              ) : (
                <div className="px-3 py-2 text-sm font-mono text-gray-500 text-center">
                  検索キーワードを入力してください
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
