import React, { useState, useEffect } from 'react';
import { Search, Eye, History, DollarSign, Trash2 } from 'lucide-react';
import { userService } from '../../services/userService';
import UserDetailsModal from './UserDetailsModal';
import UserHistoryModal from './UserHistoryModal';
import ModifyBalanceModal from './ModifyBalanceModal';

function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModifyBalance, setShowModifyBalance] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    try {
      const allUsers = userService.getAllUsers();
      setUsers(allUsers);
      setError('');
    } catch (err) {
      setError('加载用户列表失败');
      console.error('Error loading users:', err);
    }
  };

  const handleModifyBalance = (newBalance: number) => {
    if (!selectedUser) return;

    try {
      const success = userService.updateUserBalance(selectedUser.id, newBalance);
      if (success) {
        loadUsers();
        setShowModifyBalance(false);
        setSuccess('余额修改成功');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('修改余额失败');
      }
    } catch (err) {
      setError('修改余额失败');
      console.error('Error modifying balance:', err);
    }
  };

  const handleToggleStatus = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const success = userService.updateUserStatus(
      userId, 
      user.status === 'active' ? 'banned' : 'active'
    );

    if (success) {
      loadUsers();
      setSuccess(`用户状态已${user.status === 'active' ? '禁用' : '启用'}`);
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError('更新状态失败');
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">用户管理</h2>
      </div>

      {success && (
        <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-md">
          {success}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md">
          {error}
        </div>
      )}

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="搜索用户邮箱..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用户邮箱</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">余额</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">总充值</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">总消费</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">最后登录</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">注册时间</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">总订单数</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.status === 'active' ? '正常' : '已封禁'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{user.balance.toFixed(2)} USDT</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{user.totalRecharge.toFixed(2)} USDT</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{user.totalSpent.toFixed(2)} USDT</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{user.lastLogin}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{user.registerDate}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{user.totalOrders}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => {
                        setSelectedUser(user);
                        setShowModifyBalance(true);
                      }}
                      className="text-blue-600 hover:text-blue-900"
                      title="修改余额"
                    >
                      <DollarSign className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowHistory(true);
                      }}
                      className="text-green-600 hover:text-green-900"
                      title="查看历史"
                    >
                      <History className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowDetails(true);
                      }}
                      className="text-purple-600 hover:text-purple-900"
                      title="查看详情"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(user.id)}
                      className={`${
                        user.status === 'active' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                      }`}
                      title={user.status === 'active' ? '封禁用户' : '解除封禁'}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedUser && showModifyBalance && (
        <ModifyBalanceModal
          isOpen={showModifyBalance}
          onClose={() => setShowModifyBalance(false)}
          onConfirm={handleModifyBalance}
          user={selectedUser}
        />
      )}

      {selectedUser && showDetails && (
        <UserDetailsModal
          isOpen={showDetails}
          onClose={() => setShowDetails(false)}
          user={selectedUser}
        />
      )}

      {selectedUser && showHistory && (
        <UserHistoryModal
          isOpen={showHistory}
          onClose={() => setShowHistory(false)}
          user={selectedUser}
        />
      )}
    </div>
  );
}

export default UserManagement;