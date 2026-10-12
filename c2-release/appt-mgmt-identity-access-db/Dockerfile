FROM postgres:15-alpine
ENV POSTGRES_DB=iam_db
ENV POSTGRES_USER=iam_user
ENV POSTGRES_PASSWORD=iam_password
COPY init.sql /docker-entrypoint-initdb.d/
EXPOSE 5432
