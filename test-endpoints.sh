#!/bin/bash
echo "🧪 Testing All Endpoints..."
echo ""

echo "1. Testing Backend API:"
curl -s http://localhost:3000/api/events | jq 'length' && echo "   ✅ Events API working" || echo "   ❌ Events API failed"

echo ""
echo "2. Testing Frontend Pages (should return HTML):"
curl -s http://localhost:8080/ | grep -q "<title" && echo "   ✅ Home page working" || echo "   ❌ Home page failed"
curl -s http://localhost:8080/events | grep -q "<title" && echo "   ✅ Events page routing works" || echo "   ❌ Events page routing failed"
curl -s http://localhost:8080/student-auth | grep -q "<title" && echo "   ✅ Student auth page routing works" || echo "   ❌ Student auth page routing failed"
curl -s http://localhost:8080/admin-auth | grep -q "<title" && echo "   ✅ Admin auth page routing works" || echo "   ❌ Admin auth page routing failed"
curl -s http://localhost:8080/chatbot | grep -q "<title" && echo "   ✅ Chatbot page routing works" || echo "   ❌ Chatbot page routing failed"

echo ""
echo "✅ Test complete!"
