import React, { useState, useEffect } from 'react';
import { MessageSquare, ArrowUp, ArrowDown, DollarSign } from 'lucide-react';
import { priceService } from '../../services/priceService';
import { smsAPI } from '../../services/api';

function BillingDetails() {
  const [prices, setPrices] = useState({
    sendPrice: 0.1,
    receivePrice: 0.05
  });
  const [stats, setStats] = useState({
    sentCount: 0,
    receivedCount: 0,
    totalSpent: 0
  });

  useEffect(() => {
    const settings = priceService.getSettings();
    setPrices({
      sendPrice: settings.sendPrice,
      receivePrice: settings.receivePrice
    });

    // 计算消息统计
    const history = smsAPI.getLocalHistory();
    const sentMessages = history.filter(msg => !msg.isIncoming);
    const receivedMessages = history.filter(msg => msg.isIncoming);
    
    setStats({
      sentCount: sentMessages.length,
      receivedCount: receivedMessages.length,
      totalSpent: sentMessages.length * settings.sendPrice + receivedMessages.length * settings.receivePrice
    });
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">计费详情</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* 发送消息统计 */}
        <div className="bg-blue-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                <ArrowUp className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium">发送消息</h3>
            </div>
            <MessageSquare className="w-6 h-6 text-blue-600" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">单价:</span>
              <span className="font-medium">{prices.sendPrice} USDT/条</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">发送总量:</span>
              <span className="font-medium">{stats.sentCount} 条</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">消费金额:</span>
              <span className="font-medium">{(stats.sentCount * prices.sendPrice).toFixed(2)} USDT</span>
            </div>
          </div>
        </div>

        {/* 接收消息统计 */}
        <div className="bg-green-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="bg-green-100 p-2 rounded-lg mr-3">
                <ArrowDown className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium">接收消息</h3>
            </div>
            <MessageSquare className="w-6 h-6 text-green-600" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">单价:</span>
              <span className="font-medium">{prices.receivePrice} USDT/条</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">接收总量:</span>
              <span className="font-medium">{stats.receivedCount} 条</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">消费金额:</span>
              <span className="font-medium">{(stats.receivedCount * prices.receivePrice).toFixed(2)} USDT</span>
            </div>
          </div>
        </div>
      </div>

      {/* 总计消费 */}
      <div className="bg-purple-50 rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="bg-purple-100 p-2 rounded-lg mr-3">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-medium">总计消费</h3>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">总消息数:</span>
            <span className="font-medium">{stats.sentCount + stats.receivedCount} 条</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">总消费金额:</span>
            <span className="font-medium">{stats.totalSpent.toFixed(2)} USDT</span>
          </div>
        </div>
      </div>

      {/* 计费说明 */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-medium mb-4">计费说明</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>• 发送短信: {prices.sendPrice} USDT/条</li>
          <li>• 接收短信: {prices.receivePrice} USDT/条</li>
          <li>• 计费周期: 实时计费，余额实时扣除</li>
          <li>• 余额不足时将无法发送新消息</li>
        </ul>
      </div>
    </div>
  );
}

export default BillingDetails;