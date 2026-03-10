#!/bin/bash
# Admin auth test suite
BASE=http://localhost:5000
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

pass() { echo -e "${GREEN}✓ PASS${NC}: $1"; }
fail() { echo -e "${RED}✗ FAIL${NC}: $1"; exit 1; }

echo "=== Admin Auth Test Suite ==="
echo ""

# 1. Valid login
R=$(curl -s -w "%{http_code}" -X POST $BASE/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@barber2door.com","password":"Ca34@Dmh56"}')
BODY="${R:0:${#R}-3}"
CODE="${R: -3}"
[[ "$CODE" == "200" && "$BODY" == *"success\":true"* && "$BODY" == *"token"* ]] && pass "Valid login returns token" || fail "Valid login (got $CODE)"

# 2. Wrong password → 401
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@barber2door.com","password":"wrong"}')
[[ "$CODE" == "401" ]] && pass "Wrong password → 401" || fail "Wrong password (got $CODE)"

# 3. Wrong email → 401
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/api/auth/login -H "Content-Type: application/json" -d '{"email":"x@x.com","password":"Ca34@Dmh56"}')
[[ "$CODE" == "401" ]] && pass "Wrong email → 401" || fail "Wrong email (got $CODE)"

# 4. Missing email → 400
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/api/auth/login -H "Content-Type: application/json" -d '{"password":"Ca34@Dmh56"}')
[[ "$CODE" == "400" ]] && pass "Missing email → 400" || fail "Missing email (got $CODE)"

# 5. Missing password → 400
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@barber2door.com"}')
[[ "$CODE" == "400" ]] && pass "Missing password → 400" || fail "Missing password (got $CODE)"

# 6. JWT protects admin routes
TOKEN=$(curl -s -X POST $BASE/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@barber2door.com","password":"Ca34@Dmh56"}' | jq -r '.token')
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X GET $BASE/api/admin/orders -H "Authorization: Bearer $TOKEN")
[[ "$CODE" == "200" ]] && pass "Valid JWT → admin/orders 200" || fail "Valid JWT admin route (got $CODE)"

# 7. No token → 401
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X GET $BASE/api/admin/orders)
[[ "$CODE" == "401" ]] && pass "No token → 401" || fail "No token (got $CODE)"

# 8. Invalid token → 401
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X GET $BASE/api/admin/orders -H "Authorization: Bearer bad.token")
[[ "$CODE" == "401" ]] && pass "Invalid token → 401" || fail "Invalid token (got $CODE)"

# 9. Second admin login (manager was added earlier)
R=$(curl -s -w "%{http_code}" -X POST $BASE/api/auth/login -H "Content-Type: application/json" -d '{"email":"manager@barber2door.com","password":"TestPass123"}')
BODY="${R:0:${#R}-3}"
CODE="${R: -3}"
[[ "$CODE" == "200" && "$BODY" == *"success\":true"* ]] && pass "Second admin (manager) can login" || fail "Second admin login (got $CODE)"

# 10. Email case insensitivity
R=$(curl -s -w "%{http_code}" -X POST $BASE/api/auth/login -H "Content-Type: application/json" -d '{"email":"ADMIN@barber2door.com","password":"Ca34@Dmh56"}')
BODY="${R:0:${#R}-3}"
CODE="${R: -3}"
[[ "$CODE" == "200" && "$BODY" == *"success\":true"* ]] && pass "Uppercase email works (case-insensitive)" || fail "Case insensitivity (got $CODE)"

echo ""
echo -e "${GREEN}All 10 tests passed!${NC}"
