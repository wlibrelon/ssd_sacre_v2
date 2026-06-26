ARG DISTRO=nginx
ARG DISTROVERSION=1.30.3

FROM $DISTRO:$DISTROVERSION

# Copia a página HTML customizada do IPT e cria as configurações de hardening SSL do Nginx
RUN echo '<!DOCTYPE html>\n<html>\n\n<head>\n<title>ipt.br</title>\n<style>\n    body {\n        color: white;\n        width: 35em;\n        margin: 0 auto;\n        font-family: Tahoma, Verdana, Arial, sans-serif;\n    }\n</style>\n</head>\n<body bgcolor=#005b8e>\n<p align="center"><img src="https://www.ipt.br/wp-content/uploads/2023/01/Group-45-1.png" width="198" height="96" border="0" alt="Instituto de Pesquisas e Tecnologicas"></p>\n<h3 align="center">Se&ccedil;&atilde;o de IoT, Transporte e Engenharia Conectada - SITEC</h3>\n<p align="center">Para maiores informa&ccedil;&otilde;es, acesse <a href="https://ipt.br/2023/01/24/td/">www.ipt.br</a>.</p>\n</body>\n</html>' > /usr/share/nginx/html/index.html && \
    echo '    server_tokens off;\n\n    ssl_session_cache shared:le_nginx_SSL:10m;\n    ssl_session_timeout 1440m;\n    ssl_session_tickets off;\n\n    ssl_stapling on;\n    ssl_stapling_verify on;\n\n    ssl_protocols TLSv1.2 TLSv1.3;\n    ssl_prefer_server_ciphers off;\n\n    ssl_ecdh_curve X25519:prime256v1:secp384r1;\n    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384:DHE-RSA-CHACHA20-POLY1305;' > /etc/nginx/conf.d/ssl.conf

# Copia as configurações do Nginx (incluindo o default.conf com múltiplos domínios)
COPY conf.d/ /etc/nginx/conf.d/

EXPOSE 80 443