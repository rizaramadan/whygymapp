#!/bin/bash

# Load environment variables from .env file
ENV_FILE="../src/.env"
source $ENV_FILE

# Construct the database URL
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=disable"

# Use the database URL in the migrate command
migrate -database "$DATABASE_URL" -path migrations up

# dump current database to schema.sql, remove if exists
if [ -f "schema.sql" ]; then
    rm schema.sql
fi

pg_dump -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -s > schema.sql 