#!/bin/bash
# 部署到 ECS 47.114.121.178
set -e

KEY="C:/Users/Lenovo/Downloads/my-origin.pem"
HOST="root@47.114.121.178"
APP_DIR="/opt/rhythm-community"
PROJECT_DIR="D:/01_Workspaces/My-project/My-project/laoda-homework/projects"

echo "=== 1. 打包源码 ==="
cd "$PROJECT_DIR"
tar --exclude="node_modules" --exclude=".next" --exclude=".git" -czf /tmp/rhythm-dist.tar.gz .

echo "=== 2. 上传到 ECS ==="
scp -i "$KEY" -o StrictHostKeyChecking=no /tmp/rhythm-dist.tar.gz $HOST:/tmp/

echo "=== 3. 解压 & 安装依赖 ==="
ssh -i "$KEY" -o StrictHostKeyChecking=no $HOST << 'REMOTE'
set -e
APP_DIR="/opt/rhythm-community"

mkdir -p $APP_DIR
cd $APP_DIR

# 停止旧进程
pkill -f "next start" || true
sleep 2

# 解压
tar -xzf /tmp/rhythm-dist.tar.gz -C $APP_DIR

# 移除 pnpm 限制
sed -i 's/"preinstall": "npx only-allow pnpm",//' package.json

# 安装依赖
npm install --omit=dev 2>&1 | tail -5

# 构建
npx next build 2>&1 | tail -10

echo "Build complete"
REMOTE

echo "=== 4. 启动服务 ==="
ssh -i "$KEY" -o StrictHostKeyChecking=no $HOST << 'REMOTE'
cd /opt/rhythm-community
nohup npx next start -p 3005 > /var/log/rhythm-community.log 2>&1 &
echo "Started on port 3005 (PID: $!)"
sleep 3
curl -s -o /dev/null -w "%{http_code}" http://localhost:3005/login
REMOTE

echo ""
echo "=== Done ==="
echo "App running on ECS port 3005"
echo "Access: http://47.114.121.178:3005"
