# Load environment variables from .env file
$envFilePath = "../src/.env"
$envContent = Get-Content $envFilePath

# Parse the individual components from the .env file
$dbHost = ($envContent | Where-Object { $_ -match "^DB_HOST=" }) -replace "^DB_HOST=", ""
$dbPort = ($envContent | Where-Object { $_ -match "^DB_PORT=" }) -replace "^DB_PORT=", ""
$dbUser = ($envContent | Where-Object { $_ -match "^DB_USER=" }) -replace "^DB_USER=", ""
$dbPassword = ($envContent | Where-Object { $_ -match "^DB_PASSWORD=" }) -replace "^DB_PASSWORD=", ""
$dbName = ($envContent | Where-Object { $_ -match "^DB_NAME=" }) -replace "^DB_NAME=", ""

# Construct the database URL
$databaseUrl = "postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}?sslmode=disable"

# Use the database URL in the migrate command
migrate -database $databaseUrl -path migrations up

# dump current database to schema.sql, remove if exists
if (Test-Path "schema.sql") {
    Remove-Item "schema.sql"
}

pg_dump -U $dbUser -h $dbHost -p $dbPort -d $dbName -s > schema.sql

