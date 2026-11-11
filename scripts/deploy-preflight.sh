#!/usr/bin/env bash
# ==============================================================================
# JUIT Assessment & Management Portal - Deployment Helper & Preflight Check Script
# ==============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}====================================================${NC}"
echo -e "${CYAN}  JUIT Portal Pre-Deployment & Verification Script  ${NC}"
echo -e "${CYAN}====================================================${NC}\n"

# 1. Check Node.js and npm
echo -e "${YELLOW}[1/4] Checking Node.js environment...${NC}"
if command -v node >/dev/null 2>&1; then
    NODE_VER=$(node -v)
    echo -e "${GREEN}✓ Node.js installed:${NC} $NODE_VER"
else
    echo -e "${RED}✗ Node.js is not installed.${NC}"
    exit 1
fi

# 2. Check and test Frontend Build
echo -e "\n${YELLOW}[2/4] Testing Frontend Vite production build...${NC}"
if [ -d "frontend" ]; then
    cd frontend
    if [ ! -d "node_modules" ]; then
        echo -e "${CYAN}Installing frontend dependencies...${NC}"
        npm install --legacy-peer-deps
    fi
    echo -e "${CYAN}Running npm run build...${NC}"
    npm run build
    echo -e "${GREEN}✓ Frontend build succeeded! (dist/ created successfully)${NC}"
    cd ..
else
    echo -e "${RED}✗ Directory 'frontend' not found.${NC}"
    exit 1
fi

# 3. Check API Gateway syntax and dependencies
echo -e "\n${YELLOW}[3/4] Verifying API Gateway...${NC}"
if [ -d "api-gateway" ]; then
    cd api-gateway
    if [ ! -d "node_modules" ]; then
        echo -e "${CYAN}Installing api-gateway dependencies...${NC}"
        npm install
    fi
    # Check syntax
    node -c src/index.js
    echo -e "${GREEN}✓ API Gateway syntax is valid.${NC}"
    cd ..
fi

# 4. Check Environment File (.env.example vs .env)
echo -e "\n${YELLOW}[4/4] Checking Environment Configurations...${NC}"
if [ -f ".env" ]; then
    echo -e "${GREEN}✓ .env file exists.${NC}"
else
    echo -e "${YELLOW}! No .env found. Created from .env.example...${NC}"
    cp .env.example .env
fi

echo -e "\n${GREEN}====================================================${NC}"
echo -e "${GREEN}✓ All preflight checks passed! Ready to deploy.${NC}"
echo -e "${GREEN}====================================================${NC}"
echo -e "\n${CYAN}Next Deployment Steps:${NC}"
echo -e " 1. ${YELLOW}PostgreSQL:${NC} Create a free DB at https://neon.tech or https://supabase.com"
echo -e " 2. ${YELLOW}Backend API:${NC} Deploy 'api-gateway' to https://render.com (Web Service, Free)"
echo -e " 3. ${YELLOW}Frontend:${NC} Deploy 'frontend' to https://vercel.com (Root Directory: frontend)"
echo -e " 4. Set ${YELLOW}VITE_API_URL${NC} in Vercel to your Render backend URL."
echo -e " 5. Set ${YELLOW}ALLOWED_ORIGINS${NC} in Render to your Vercel URL.\n"
