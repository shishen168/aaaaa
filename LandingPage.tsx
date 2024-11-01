import React from 'react';
import { MessageSquare, Shield, Zap, Globe, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import MatrixRain from '../effects/MatrixRain';

function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white relative overflow-hidden">
      <MatrixRain />
      
      {/* Hero Section */}
      <div className="relative">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              神域短信平台
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8">
              专业的短信服务解决方案，为您提供全球通讯服务
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/register"
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium flex items-center justify-center"
              >
                立即注册
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link
                to="/login"
                className="px-8 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium"
              >
                登录账号
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative py-16 bg-black/50 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 rounded-lg border border-gray-800 hover:border-blue-500 transition-colors">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">全球覆盖</h3>
              <p className="text-gray-400">
                支持200+国家和地区的短信发送服务，让您的信息传遍全球
              </p>
            </div>

            <div className="p-6 rounded-lg border border-gray-800 hover:border-blue-500 transition-colors">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">安全可靠</h3>
              <p className="text-gray-400">
                采用先进的加密技术，确保您的通信安全和数据隐私
              </p>
            </div>

            <div className="p-6 rounded-lg border border-gray-800 hover:border-blue-500 transition-colors">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">快速稳定</h3>
              <p className="text-gray-400">
                高性能发送通道，确保消息快速送达，到达率99.9%
              </p>
            </div>

            <div className="p-6 rounded-lg border border-gray-800 hover:border-blue-500 transition-colors">
              <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">多语言支持</h3>
              <p className="text-gray-400">
                支持多种语言短信发送，满足您的国际化业务需求
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="relative py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">价格方案</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* 基础版 */}
            <div className="p-8 rounded-lg border border-gray-800 hover:border-blue-500 transition-colors">
              <h3 className="text-xl font-semibold mb-4">基础版</h3>
              <div className="text-3xl font-bold mb-4">
                ¥0.05
                <span className="text-sm font-normal text-gray-400">/条</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <span className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center mr-2">✓</span>
                  全球短信发送
                </li>
                <li className="flex items-center">
                  <span className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center mr-2">✓</span>
                  基础统计报表
                </li>
                <li className="flex items-center">
                  <span className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center mr-2">✓</span>
                  7×24小时支持
                </li>
              </ul>
              <Link
                to="/register"
                className="block w-full py-2 text-center bg-blue-600 hover:bg-blue-700 rounded-lg font-medium"
              >
                立即开始
              </Link>
            </div>

            {/* 专业版 */}
            <div className="p-8 rounded-lg border-2 border-blue-500 relative transform scale-105">
              <div className="absolute top-0 right-0 bg-blue-500 text-sm px-3 py-1 rounded-bl-lg">推荐</div>
              <h3 className="text-xl font-semibold mb-4">专业版</h3>
              <div className="text-3xl font-bold mb-4">
                ¥0.04
                <span className="text-sm font-normal text-gray-400">/条</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <span className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center mr-2">✓</span>
                  包含基础版所有功能
                </li>
                <li className="flex items-center">
                  <span className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center mr-2">✓</span>
                  高级统计分析
                </li>
                <li className="flex items-center">
                  <span className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center mr-2">✓</span>
                  专业的技术服务
                </li>
                <li className="flex items-center">
                  <span className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center mr-2">✓</span>
                  优先发送通道
                </li>
              </ul>
              <Link
                to="/register"
                className="block w-full py-2 text-center bg-blue-600 hover:bg-blue-700 rounded-lg font-medium"
              >
                立即开始
              </Link>
            </div>

            {/* 企业版 */}
            <div className="p-8 rounded-lg border border-gray-800 hover:border-blue-500 transition-colors">
              <h3 className="text-xl font-semibold mb-4">企业版</h3>
              <div className="text-3xl font-bold mb-4">
                定制
                <span className="text-sm font-normal text-gray-400">/月</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <span className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center mr-2">✓</span>
                  包含专业版所有功能
                </li>
                <li className="flex items-center">
                  <span className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center mr-2">✓</span>
                  独立发送通道
                </li>
                <li className="flex items-center">
                  <span className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center mr-2">✓</span>
                  定制化解决方案
                </li>
                <li className="flex items-center">
                  <span className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center mr-2">✓</span>
                  专属客户经理
                </li>
              </ul>
              <Link
                to="/register"
                className="block w-full py-2 text-center bg-blue-600 hover:bg-blue-700 rounded-lg font-medium"
              >
                联系我们
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative py-12 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-4">关于我们</h4>
              <p className="text-gray-400">
                神域短信平台致力于提供专业、可靠的全球短信服务解决方案
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">快速链接</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/register" className="text-gray-400 hover:text-white">
                    注册账号
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="text-gray-400 hover:text-white">
                    登录
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" className="text-gray-400 hover:text-white">
                    价格方案
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">联系方式</h4>
              <ul className="space-y-2 text-gray-400">
                <li>邮箱：没有，哈哈哈</li>
                <li>电话：也没有，哈哈</li>
                <li>工作时间：只要干不死，就往死里干</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">关注我们</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Facebook</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Twitter</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">GitHub</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>© 2024 神域短信平台. 保留所有权利.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;