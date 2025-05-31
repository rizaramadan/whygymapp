#!/bin/bash

# Exit on any error
set -e

# Configuration
APP_PORT=3000
DB_PORT=5435
DB_NAME=whygym_test
DB_USER=postgres
DB_PASSWORD=postgres
NETWORK_NAME=whygym_test_network
MIGRATIONS_DIR="db/migrations"
MIGRATE_IMAGE="migrate/migrate:v4.16.2"

# Common environment variables for both app and tests
export NODE_ENV=test
export PORT=$APP_PORT
export POSTGRES_HOST=localhost
export POSTGRES_PORT=$DB_PORT
export POSTGRES_DB=$DB_NAME
export POSTGRES_USER=$DB_USER
export POSTGRES_PASSWORD=$DB_PASSWORD
export DATABASE_URL="postgres://${DB_USER}:${DB_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${DB_NAME}?sslmode=disable"
export APP_URL="http://localhost:${APP_PORT}"
export SENTRY_SKIP_UPLOAD=true

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status messages
print_status() {
    echo -e "${GREEN}==>${NC} $1"
}

# Function to print warning messages
print_warning() {
    echo -e "${YELLOW}Warning:${NC} $1"
}

# Function to print error messages
print_error() {
    echo -e "${RED}Error:${NC} $1"
}

# Function to check and install npm dependencies
setup_dependencies() {
    print_status "Checking npm dependencies..."
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        print_status "Installing npm dependencies..."
        npm install
    else
        # Check if package.json was modified after node_modules
        if [ "package.json" -nt "node_modules" ]; then
            print_status "package.json was modified, updating dependencies..."
            npm install
        else
            print_status "npm dependencies are up to date"
        fi
    fi

    # Install Playwright browsers if not already installed
    if [ ! -d "node_modules/.cache/playwright" ]; then
        print_status "Installing Playwright browsers..."
        npx playwright install --with-deps chromium
    fi
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Function to check if PostgreSQL container is already running
check_existing_db() {
    if docker ps | grep -q "whygym_test_db.*:5435->5432/tcp"; then
        print_status "Found existing test database container, reusing it..."
        return 0
    elif docker ps -a | grep -q "whygym_test_db"; then
        # Container exists but might be stopped
        print_status "Found stopped test database container, starting it..."
        docker start whygym_test_db
        # Wait for PostgreSQL to be ready
        print_status "Waiting for PostgreSQL to be ready..."
        until docker exec whygym_test_db pg_isready -h localhost -U $DB_USER >/dev/null 2>&1; do
            sleep 1
        done
        return 0
    fi
    return 1
}

# Function to check if ports are available
check_ports() {
    if lsof -i :$APP_PORT > /dev/null 2>&1; then
        print_error "Port $APP_PORT is already in use. Please free up this port and try again."
        exit 1
    fi
    
    # Check if port 5435 is in use by our test database
    if lsof -i :$DB_PORT > /dev/null 2>&1; then
        if docker ps | grep -q "whygym_test_db.*:5435->5432/tcp"; then
            print_status "Port $DB_PORT is in use by our test database container, will reuse it..."
            return 0
        else
            print_error "Port $DB_PORT is in use by another process. Please free up this port and try again."
            exit 1
        fi
    fi
}

# Function to clean up any existing test containers
cleanup_existing() {
    print_status "Checking for existing test containers..."
    
    # Only remove containers if they're not the ones we want to reuse
    if ! check_existing_db; then
        if docker ps -a | grep -q whygym_test_db; then
            print_status "Found existing test database container, removing..."
            docker stop whygym_test_db 2>/dev/null || true
            docker rm whygym_test_db 2>/dev/null || true
        fi
    fi
    
    # Remove test network if it exists
    if docker network ls | grep -q $NETWORK_NAME; then
        print_status "Found existing test network, removing..."
        docker network rm $NETWORK_NAME 2>/dev/null || true
    fi
}

# Cleanup function
cleanup() {
    print_status "Cleaning up..."
    
    # Kill any process using port 3000
    if lsof -ti :3000 > /dev/null 2>&1; then
        print_status "Killing process using port 3000..."
        lsof -ti :3000 | xargs kill -9 2>/dev/null || true
    fi
    
    # Stop the local app if it's running
    if pgrep -f "npm run start:dev" > /dev/null; then
        print_status "Stopping local app..."
        pkill -f "npm run start:dev" 2>/dev/null || true
    fi
    
    # Stop PostgreSQL container
    docker stop whygym_test_db 2>/dev/null || true
    docker rm whygym_test_db 2>/dev/null || true
    
    # Remove network
    docker network rm $NETWORK_NAME 2>/dev/null || true
    
    # Remove test artifacts
    rm -rf test-results/ playwright-report/ 2>/dev/null || true
    
    print_status "Cleanup complete"
}

# Set up cleanup on script exit
trap cleanup EXIT

# Check prerequisites
check_docker
check_ports
cleanup_existing
setup_dependencies

# Create network if it doesn't exist
if ! docker network inspect $NETWORK_NAME >/dev/null 2>&1; then
    print_status "Creating Docker network: $NETWORK_NAME"
    docker network create $NETWORK_NAME
fi

# Start PostgreSQL container if not already running
if ! check_existing_db; then
    print_status "Starting PostgreSQL container..."
    docker run -d \
        --name whygym_test_db \
        --network $NETWORK_NAME \
        -e POSTGRES_DB=$DB_NAME \
        -e POSTGRES_USER=$DB_USER \
        -e POSTGRES_PASSWORD=$DB_PASSWORD \
        -p $DB_PORT:5432 \
        postgres:15

    # Wait for PostgreSQL to be ready
    print_status "Waiting for PostgreSQL to be ready..."
    until docker exec whygym_test_db pg_isready -h localhost -U $DB_USER >/dev/null 2>&1; do
        sleep 1
    done
else
    # Ensure the container is on our network
    if ! docker network inspect $NETWORK_NAME | grep -q whygym_test_db; then
        print_status "Connecting existing database to test network..."
        docker network connect $NETWORK_NAME whygym_test_db
    fi
fi

# Run database migrations using golang-migrate Docker image
print_status "Running database migrations..."
# Use the Docker network name for migrations
MIGRATION_DATABASE_URL="postgres://${DB_USER}:${DB_PASSWORD}@whygym_test_db:5432/${DB_NAME}?sslmode=disable"
docker run --rm \
    --network $NETWORK_NAME \
    -v "$(pwd)/${MIGRATIONS_DIR}:/migrations" \
    $MIGRATE_IMAGE \
    -path=/migrations \
    -database="$MIGRATION_DATABASE_URL" \
    up

# Run the tests (Playwright will handle app startup)
print_status "Running tests..."
npx playwright test --reporter=html

# Check test results
if [ $? -eq 0 ]; then
    print_status "All tests passed successfully!"
    # Open the test report if not in CI
    if [ -z "$CI" ]; then
        print_status "Opening test report..."
        open playwright-report/index.html
    fi
else
    print_error "Some tests failed. Check the test report for details."
    # Open the test report if not in CI
    if [ -z "$CI" ]; then
        print_status "Opening test report..."
        open playwright-report/index.html
    fi
    exit 1
fi 