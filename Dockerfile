FROM node:22-alpine

LABEL maintainer="Montimage <contact@montimage.com>"

RUN mkdir -p /opt/mmt/operator

COPY www /opt/mmt/operator

RUN chmod +x /opt/mmt/operator/bin/www


EXPOSE 8080

ENTRYPOINT ["/opt/mmt/operator/bin/www"]
