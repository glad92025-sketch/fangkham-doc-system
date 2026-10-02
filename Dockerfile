# Dockerfile สำหรับ Deploy บน Render.com หรือ Docker Server
FROM php:8.2-fpm-alpine

# ติดตั้ง System Dependencies & PHP Extensions
RUN apk add --no-cache \
    nginx \
    supervisor \
    curl \
    git \
    libpng-dev \
    libxml2-dev \
    libzip-dev \
    zip \
    unzip \
    postgresql-dev \
    oniguruma-dev

RUN docker-php-ext-install pdo pdo_pgsql pdo_mysql mbstring exif pcntl bcmath gd zip

# ติดตั้ง Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# กำหนด Working Directory
WORKDIR /var/www/html

# คัดลอกโค้ดโปรเจกต์
COPY . .

# ติดตั้ง Dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction

# ตั้งค่า Permission
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# คอนฟิก Nginx & Supervisor
COPY ./docker/nginx.conf /etc/nginx/http.d/default.conf
COPY ./docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

EXPOSE 80

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
