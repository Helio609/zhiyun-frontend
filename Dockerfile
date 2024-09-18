# 使用Node.js v20.12.1的官方镜像作为基础镜像
FROM node:lts-alpine

# 创建并设置工作目录
WORKDIR /app

# 将 package.json 和 package-lock.json 复制到工作目录
COPY package*.json ./

# 安装依赖
RUN npm install -g pnpm

# 复制应用源代码
COPY . .

# 暴露端口3000
EXPOSE 3000

# 设置环境变量 (NEXT_PUBLIC_API_URL可以在运行时覆盖)
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# 构建Next.js应用
RUN pnpm i && pnpm build

# 启动应用
CMD ["pnpm", "start"]
