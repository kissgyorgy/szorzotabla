deploy:
    npm run build
    rsync -av --delete dist/ nixstinger:/var/www/static/szorzotabla/
