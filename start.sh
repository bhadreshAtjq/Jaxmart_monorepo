#!/bin/bash

# ==============================================================================
# Jaxmart Monorepo Start Command
# Starts both Backend and Web services concurrently.
# ==============================================================================

# Define color codes for beautiful output
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Determine script directory
MONOREPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${CYAN}======================================================================${NC}"
echo -e "${CYAN}                Starting Jaxmart Development Services                 ${NC}"
echo -e "${CYAN}======================================================================${NC}"

# Function to check and install dependencies
check_deps() {
    local dir=$1
    local name=$2
    
    if [ ! -d "$MONOREPO_DIR/$dir/node_modules" ]; then
        echo -e "${YELLOW}[System] node_modules not found for $name. Installing dependencies...${NC}"
        cd "$MONOREPO_DIR/$dir" || exit 1
        npm install
        if [ $? -ne 0 ]; then
            echo -e "${RED}Error: Failed to install dependencies for $name.${NC}"
            exit 1
        fi
        echo -e "${GREEN}[System] Dependencies installed successfully for $name.${NC}"
    fi
}

# Function to check environment variables
check_env() {
    local dir=$1
    local name=$2
    local example_file=$3
    local env_file=$4
    
    if [ ! -f "$MONOREPO_DIR/$dir/$env_file" ]; then
        if [ -f "$MONOREPO_DIR/$dir/$example_file" ]; then
            echo -e "${YELLOW}[System] $env_file not found for $name. Copying from $example_file...${NC}"
            cp "$MONOREPO_DIR/$dir/$example_file" "$MONOREPO_DIR/$dir/$env_file"
            echo -e "${GREEN}[System] Created $env_file for $name. Please verify its content if needed.${NC}"
        else
            echo -e "${RED}Warning: Neither $env_file nor $example_file found for $name.${NC}"
        fi
    fi
}

# Check and setup environment
check_env "backend" "Backend" ".env.example" ".env"
check_env "web" "Web" ".env.example" ".env"

# Check and install dependencies if missing
check_deps "backend" "Backend"
check_deps "web" "Web"

# Function to kill process on a port if in use
kill_port() {
    local port=$1
    if lsof -t -i :$port >/dev/null 2>&1; then
        echo -e "${YELLOW}[System] Port $port is in use. Freeing port...${NC}"
        if [ -x "$(command -v fuser)" ]; then
            fuser -k ${port}/tcp >/dev/null 2>&1
        else
            lsof -t -i:${port} | xargs kill -9 >/dev/null 2>&1
        fi
        sleep 1
    fi
}

# Free ports 3000 and 4000 if in use
kill_port 3000
kill_port 4000

# Run concurrently using npx (automatic install if needed, via -y)
echo -e "${GREEN}[System] Running Backend and Web servers concurrently...${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop both services.${NC}"
echo -e "${CYAN}======================================================================${NC}"

npx -y concurrently \
  --kill-others \
  --names "Backend,Web" \
  --prefix "[{name}]" \
  --prefix-colors "cyan,green" \
  "cd \"$MONOREPO_DIR/backend\" && npm run dev" \
  "cd \"$MONOREPO_DIR/web\" && npm run dev"
