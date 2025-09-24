#FROM nginx:stable-alpine
#
## Remove arquivos padrão do Nginx
#RUN rm -rf /usr/share/nginx/html/*
#RUN rm -rf /etc/nginx/conf.d/*
#
## Copia os arquivos do seu site
#COPY . /usr/share/nginx/html
#
## Copia a configuração customizada do Nginx
#COPY nginx.conf /etc/nginx/conf.d/default.conf
#
#EXPOSE 80

FROM nginx:stable-alpine

# Instalações adicionais para SSL (se necessário)
RUN apk update && apk add --no-cache openssl

# Remove arquivos padrão do Nginx
RUN rm -rf /usr/share/nginx/html/*
RUN rm -rf /etc/nginx/conf.d/*

# Copia os arquivos do seu site
COPY . /usr/share/nginx/html

# Copia a configuração customizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80 443