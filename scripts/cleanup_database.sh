#!/bin/bash

# Database Cleanup Script for Echain DApp
# Removes placeholder and test events from production database

BASE_URL="https://echain-eight.vercel.app"
TIMESTAMP=$(date +%s)
RESULTS_FILE="database_cleanup_$(date +%Y%m%d_%H%M%S).log"

echo "🧹 ECHAIN DATABASE CLEANUP 🧹" | tee $RESULTS_FILE
echo "==============================" | tee -a $RESULTS_FILE
echo "Base URL: $BASE_URL" | tee -a $RESULTS_FILE
echo "Cleanup Time: $(date)" | tee -a $RESULTS_FILE
echo "Results saved to: $RESULTS_FILE" | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Step 1: Check current events in database
echo "📊 Step 1: Current Events Analysis" | tee -a $RESULTS_FILE
echo "-----------------------------------" | tee -a $RESULTS_FILE
echo "Fetching current events from database..." | tee -a $RESULTS_FILE
CURRENT_EVENTS=$(curl -s "$BASE_URL/api/events")
echo "Current events response:" | tee -a $RESULTS_FILE
echo "$CURRENT_EVENTS" | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Count placeholder events
CARDANO_COUNT=$(echo "$CURRENT_EVENTS" | grep -o "Cardano Community Meetup" | wc -l)
PLACEHOLDER_COUNT=$(echo "$CURRENT_EVENTS" | grep -o "ipfs://placeholder" | wc -l)
TEST_COUNT=$(echo "$CURRENT_EVENTS" | grep -o "Test001" | wc -l)

echo "📈 Analysis Results:" | tee -a $RESULTS_FILE
echo "- 'Cardano Community Meetup' events found: $CARDANO_COUNT" | tee -a $RESULTS_FILE
echo "- 'ipfs://placeholder' entries found: $PLACEHOLDER_COUNT" | tee -a $RESULTS_FILE
echo "- 'Test001' events found: $TEST_COUNT" | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

if [ "$CARDANO_COUNT" -eq 0 ] && [ "$PLACEHOLDER_COUNT" -eq 0 ] && [ "$TEST_COUNT" -eq 0 ]; then
    echo "✅ Database appears clean! No placeholder events found." | tee -a $RESULTS_FILE
    echo "🏁 Cleanup not needed." | tee -a $RESULTS_FILE
    exit 0
fi

# Step 2: Check what events would be cleaned up
echo "� Step 2: Cleanup Analysis" | tee -a $RESULTS_FILE
echo "----------------------------" | tee -a $RESULTS_FILE
echo "Analyzing placeholder events that would be removed..." | tee -a $RESULTS_FILE
ANALYSIS_RESPONSE=$(curl -s "$BASE_URL/api/database/cleanup")
echo "Analysis response:" | tee -a $RESULTS_FILE
echo "$ANALYSIS_RESPONSE" | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Step 3: Perform dry run cleanup
echo "🧪 Step 3: Dry Run Cleanup" | tee -a $RESULTS_FILE
echo "---------------------------" | tee -a $RESULTS_FILE
echo "Performing dry run cleanup (no actual deletion)..." | tee -a $RESULTS_FILE
DRY_RUN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/database/cleanup" \
  -H "Content-Type: application/json" \
  -d '{"action": "cleanup-placeholder-events", "dryRun": true}')
echo "Dry run response:" | tee -a $RESULTS_FILE
echo "$DRY_RUN_RESPONSE" | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Step 4: Ask for confirmation for actual cleanup
echo "⚠️ Step 4: Confirmation Required" | tee -a $RESULTS_FILE
echo "---------------------------------" | tee -a $RESULTS_FILE
echo "To perform actual cleanup, run:" | tee -a $RESULTS_FILE
echo "curl -X POST '$BASE_URL/api/database/cleanup' \\" | tee -a $RESULTS_FILE
echo "  -H 'Content-Type: application/json' \\" | tee -a $RESULTS_FILE
echo "  -d '{\"action\": \"cleanup-placeholder-events\", \"dryRun\": false}'" | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

echo "🎯 RECOMMENDED ACTIONS:" | tee -a $RESULTS_FILE
echo "1. Review the dry run results above" | tee -a $RESULTS_FILE
echo "2. If everything looks correct, run the actual cleanup command" | tee -a $RESULTS_FILE
echo "3. Verify cleanup by running the events API again" | tee -a $RESULTS_FILE
echo "4. Deploy the updated code to prevent future placeholder seeding" | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

echo "🏁 CLEANUP ANALYSIS COMPLETED!" | tee -a $RESULTS_FILE
echo "Results saved to: $RESULTS_FILE" | tee -a $RESULTS_FILE