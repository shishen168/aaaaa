#!/bin/bash

# 确保脚本在错误时停止
set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

# 服务器信息
SERVER_USER="administrator"
SERVER_IP="163.123.183.112"
DEPLOY_PATH="/home/administrator/sms-backend"

echo -e "${GREEN}开始部署流程...${NC}"

# 创建部署目录
echo "创建部署目录..."
mkdir -p deploy
cd deploy

# 复制必要文件
echo "复制项目文件..."
cp -r ../backend/* .
cp ../backend/ecosystem.config.js .
cp ../backend/nginx.conf .
cp ../backend/deploy.sh .

# 创建zip包
echo "创建部署包..."
zip -r backend.zip . -x "node_modules/*" "dist/*" ".git/*"

# 上传到服务器
echo "上传文件到服务器..."
scp backend.zip $SERVER_USER@$SERVER_IP:/home/administrator/

# SSH到服务器执行部署
echo "连接服务器执行部署..."
ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
    # 创建部署目录
    mkdir -p $DEPLOY_PATH
    cd $DEPLOY_PATH

    # 解压文件
    unzip -o ../backend.zip

    # 安装依赖
    echo "安装依赖..."
    npm install
    npm install -g pm2

    # 配置Nginx
    echo "配置Nginx..."
    sudo cp nginx.conf /etc/nginx/sites-available/api.shenyukeji.cc
    sudo ln -sf /etc/nginx/sites-available/api.shenyukeji.cc /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl restart nginx

    # 启动应用
    echo "启动应用..."
    pm2 start ecosystem.config.js

    # 保存PM2进程
    echo "保存PM2进程..."
    pm2 save

    # 设置开机自启
    echo "设置开机自启..."
    pm2 startup

    echo "清理部署文件..."
    rm ../backend.zip
ENDSSH

echo -e "${GREEN}部署完成!${NC}"

# 清理本地部署文件
echo "清理本地部署文件..."
cd ..
rm -rf deploy

echo -e "${GREEN}全部完成!${NC}"