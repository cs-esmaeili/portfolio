# مرحله build
FROM node:20 AS builder

WORKDIR /app

COPY package*.json ./
COPY . .

RUN npm install
RUN npm run build

# مرحله سرو
FROM nginx:stable-alpine

COPY --from=builder /app/dist /usr/share/nginx/html

# کانفیگ Nginx پیشفرض فایل index.html رو به عنوان fallback ارائه میده
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
