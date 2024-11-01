#!/bin/bash

# 安装依赖
echo "Installing dependencies..."
npm install
npm install -g pm2

# 构建应用
echo "Building application..."
npm run build

# 配置Nginx
echo "Configuring Nginx..."
sudo cp nginx.conf /etc/nginx/sites-available/api.shenyukeji.cc
sudo ln -s /etc/nginx/sites-available/api.shenyukeji.cc /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 启动应用
echo "Starting application..."
pm2 start ecosystem.config.js

# 保存PM2进程
echo "Saving PM2 process list..."
pm2 save

# 设置开机自启
echo "Setting up startup script..."
pm2 startup

echo "Deployment completed!"