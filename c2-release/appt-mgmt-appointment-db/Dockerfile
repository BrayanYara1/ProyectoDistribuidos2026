FROM postgres:15-alpine
ENV POSTGRES_DB=appointment_db
ENV POSTGRES_USER=appt_user
ENV POSTGRES_PASSWORD=appt_password
COPY init.sql /docker-entrypoint-initdb.d/
EXPOSE 5432
