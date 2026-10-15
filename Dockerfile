# Node.js 공식 이미지 기반 (실행 환경)
FROM node:18-alpine

WORKDIR /app

# 패키지 파일 복사 및 의존성 설치
COPY package*.json ./
RUN npm install

# 소스 전체 복사
COPY . .

# 프로덕션 빌드 (필요한 경우)
RUN npm run build

# 포트 개방 (server.ts에서 사용하는 포트, 보통 3000)
EXPOSE 3000

# 앱 실행 명령어 (package.json의 start 스크립트 또는 node)
CMD ["npm", "start"]
