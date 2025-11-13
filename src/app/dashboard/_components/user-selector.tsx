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
        <div className="flex items-center justify-between rounded-md border border-slate-700 bg-slate-900 px-3 py-2">
          <div className="flex items-center gap-2 min-w-0">
            {selectedUser.pictureUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={selectedUser.pictureUrl}
                alt={selectedUser.displayName}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700">
                <User className="h-4 w-4 text-slate-400" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">{selectedUser.displayName}</p>
              <p className="text-xs text-slate-400 truncate">{selectedUser.lineUserId}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="ml-2 flex-shrink-0 rounded p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200"
            aria-label="選択を解除"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <>
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={() => {
                setIsOpen(true);
                if (searchTerm) fetchUsers(searchTerm);
              }}
              className="w-full rounded-md border border-slate-700 bg-slate-900 pl-10 pr-3 py-2 text-sm text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
              placeholder={placeholder}
            />
          </div>

          {/* Dropdown */}
          {isOpen && (
            <div
              ref={dropdownRef}
              className="absolute z-10 mt-1 w-full rounded-md border border-slate-700 bg-slate-900 shadow-lg max-h-60 overflow-auto"
            >
              {loading ? (
                <div className="px-3 py-2 text-sm text-slate-400 text-center">
                  読み込み中...
                </div>
              ) : users.length > 0 ? (
                <ul className="py-1">
                  {users.map((user) => (
                    <li key={user.id}>
                      <button
                        type="button"
                        onClick={() => handleSelectUser(user)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-slate-800 transition-colors"
                      >
                        {user.pictureUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={user.pictureUrl}
                            alt={user.displayName}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700">
                            <User className="h-4 w-4 text-slate-400" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-white truncate">{user.displayName}</p>
                          <p className="text-xs text-slate-400 truncate">{user.lineUserId}</p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : searchTerm ? (
                <div className="px-3 py-2 text-sm text-slate-400 text-center">
                  ユーザーが見つかりませんでした
                </div>
              ) : (
                <div className="px-3 py-2 text-sm text-slate-400 text-center">
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
