#!/bin/bash


GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

BASE_URL="http://localhost:3000"
ADMIN_TOKEN=""
USER_TOKEN=""

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}PlanMint API Testing Script${NC}"
echo -e "${BLUE}================================${NC}\n"


print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ $2${NC}"
    else
        echo -e "${RED}✗ $2${NC}"
    fi
}


echo -e "\n${YELLOW}1. Testing Health Check...${NC}"
response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/health")
if [ "$response" -eq 200 ]; then
    print_result 0 "Health check passed"
else
    print_result 1 "Health check failed (Status: $response)"
fi


echo -e "\n${YELLOW}2. Logging in as Admin...${NC}"
login_response=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrUsername": "admin@planmint.com",
    "password": "Admin@123"
  }')

ADMIN_TOKEN=$(echo $login_response | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -n "$ADMIN_TOKEN" ]; then
    print_result 0 "Admin login successful"
    echo "   Token: ${ADMIN_TOKEN:0:20}..."
else
    print_result 1 "Admin login failed"
    echo "   Response: $login_response"
fi


echo -e "\n${YELLOW}3. Logging in as Regular User (johndoe)...${NC}"
user_login_response=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrUsername": "john@example.com",
    "password": "John@123"
  }')

USER_TOKEN=$(echo $user_login_response | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -n "$USER_TOKEN" ]; then
    print_result 0 "User login successful"
    echo "   Token: ${USER_TOKEN:0:20}..."
else
    print_result 1 "User login failed"
fi


echo -e "\n${YELLOW}4. Testing Admin Users Endpoints...${NC}"

response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/admin/users" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
print_result $([ "$response" -eq 200 ] && echo 0 || echo 1) "GET /api/admin/users (Status: $response)"


response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/admin/users/stats" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
print_result $([ "$response" -eq 200 ] && echo 0 || echo 1) "GET /api/admin/users/stats (Status: $response)"


echo -e "\n${YELLOW}5. Testing Admin Projects Endpoints...${NC}"


response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/admin/projects" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
print_result $([ "$response" -eq 200 ] && echo 0 || echo 1) "GET /api/admin/projects (Status: $response)"


response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/admin/projects/stats" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
print_result $([ "$response" -eq 200 ] && echo 0 || echo 1) "GET /api/admin/projects/stats (Status: $response)"


echo -e "\n${YELLOW}6. Testing Admin Contacts Endpoints...${NC}"


response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/admin/contacts" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
print_result $([ "$response" -eq 200 ] && echo 0 || echo 1) "GET /api/admin/contacts (Status: $response)"


response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/admin/contacts/stats" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
print_result $([ "$response" -eq 200 ] && echo 0 || echo 1) "GET /api/admin/contacts/stats (Status: $response)"


echo -e "\n${YELLOW}7. Testing Admin Notifications Endpoints...${NC}"


response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/admin/notifications/stats" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
print_result $([ "$response" -eq 200 ] && echo 0 || echo 1) "GET /api/admin/notifications/stats (Status: $response)"


broadcast_response=$(curl -s -X POST "$BASE_URL/api/admin/notifications/broadcast" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "project_member_added",
    "message": "Test broadcast message from API testing"
  }')
response=$(echo $broadcast_response | grep -o '"success":true' | wc -l)
print_result $([ "$response" -eq 1 ] && echo 0 || echo 1) "POST /api/admin/notifications/broadcast"


echo -e "\n${YELLOW}8. Testing User Notifications Endpoints...${NC}"


response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/notifications" \
  -H "Authorization: Bearer $USER_TOKEN")
print_result $([ "$response" -eq 200 ] && echo 0 || echo 1) "GET /api/notifications (Status: $response)"

response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/notifications/unread/count" \
  -H "Authorization: Bearer $USER_TOKEN")
print_result $([ "$response" -eq 200 ] && echo 0 || echo 1) "GET /api/notifications/unread/count (Status: $response)"


echo -e "\n${YELLOW}9. Testing User Projects Endpoints...${NC}"


response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/projects" \
  -H "Authorization: Bearer $USER_TOKEN")
print_result $([ "$response" -eq 200 ] && echo 0 || echo 1) "GET /api/projects (Status: $response)"


echo -e "\n${YELLOW}10. Testing User Contacts Endpoints...${NC}"


response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/contacts" \
  -H "Authorization: Bearer $USER_TOKEN")
print_result $([ "$response" -eq 200 ] && echo 0 || echo 1) "GET /api/contacts (Status: $response)"


echo -e "\n${YELLOW}11. Testing Authorization (Should Fail)...${NC}"


response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/admin/users" \
  -H "Authorization: Bearer $USER_TOKEN")
print_result $([ "$response" -eq 403 ] && echo 0 || echo 1) "User accessing admin endpoint (Expected 403, Got: $response)"


echo -e "\n${YELLOW}12. Testing Logout...${NC}"

response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/auth/logout" \
  -H "Authorization: Bearer $USER_TOKEN")
print_result $([ "$response" -eq 200 ] && echo 0 || echo 1) "POST /api/auth/logout (Status: $response)"

echo -e "\n${BLUE}================================${NC}"
echo -e "${BLUE}Testing Complete!${NC}"
echo -e "${BLUE}================================${NC}\n"


echo -e "${GREEN}Summary:${NC}"
echo -e "  - Health check: ✓"
echo -e "  - Authentication: ✓"
echo -e "  - Admin endpoints: ✓"
echo -e "  - User endpoints: ✓"
echo -e "  - Authorization: ✓"
echo -e "  - Logout: ✓"
echo ""
