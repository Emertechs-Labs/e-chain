#!/usr/bin/env node

/**
 * Beta Feedback System Test Script
 * Tests the feedback API endpoints and widget functionality
 */

const https = require('https')
const http = require('http')

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

// Test data
const testFeedback = {
  rating: 5,
  category: 'ux',
  message: 'This is a test feedback submission from the automated test script. The feedback system is working perfectly!',
  email: 'test@echain.app',
  sessionId: 'test_session_' + Date.now(),
  url: '/test-feedback'
}

// Helper function to make HTTP requests
function makeRequest(url, options, data = null) {
  return new Promise((resolve, reject) => {
    const req = (url.startsWith('https:') ? https : http).request(url, options, (res) => {
      let body = ''
      res.on('data', (chunk) => body += chunk)
      res.on('end', () => {
        try {
          const response = {
            status: res.statusCode,
            headers: res.headers,
            body: body ? JSON.parse(body) : null
          }
          resolve(response)
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body
          })
        }
      })
    })

    req.on('error', reject)

    if (data) {
      req.write(JSON.stringify(data))
    }

    req.end()
  })
}

// Test feedback submission
async function testFeedbackSubmission() {
  console.log('🧪 Testing feedback submission...')

  try {
    const response = await makeRequest(`${BASE_URL}/api/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'BetaFeedbackTest/1.0'
      }
    }, testFeedback)

    if (response.status === 200 && response.body?.success) {
      console.log('✅ Feedback submission successful')
      console.log('   Feedback ID:', response.body.feedbackId)
      return true
    } else {
      console.log('❌ Feedback submission failed')
      console.log('   Status:', response.status)
      console.log('   Response:', response.body)
      return false
    }
  } catch (error) {
    console.log('❌ Error submitting feedback:', error.message)
    return false
  }
}

// Test feedback analytics (GET endpoint)
async function testFeedbackAnalytics() {
  console.log('📊 Testing feedback analytics...')

  const adminToken = process.env.ADMIN_API_KEY || process.env.NEXT_PUBLIC_ADMIN_API_KEY

  if (!adminToken) {
    console.log('⚠️  Skipping analytics test - no admin token configured')
    return false
  }

  try {
    const response = await makeRequest(`${BASE_URL}/api/feedback`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    })

    if (response.status === 200) {
      console.log('✅ Analytics retrieval successful')
      console.log('   Total feedback:', response.body?.totalFeedback || 0)
      console.log('   Average rating:', response.body?.averageRating || 0)
      return true
    } else {
      console.log('❌ Analytics retrieval failed')
      console.log('   Status:', response.status)
      console.log('   Response:', response.body)
      return false
    }
  } catch (error) {
    console.log('❌ Error retrieving analytics:', error.message)
    return false
  }
}

// Test validation
async function testValidation() {
  console.log('🔍 Testing input validation...')

  const invalidFeedback = {
    rating: 6, // Invalid rating
    category: 'invalid',
    message: 'Too short'
  }

  try {
    const response = await makeRequest(`${BASE_URL}/api/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, invalidFeedback)

    if (response.status === 400 && response.body?.error) {
      console.log('✅ Validation working correctly')
      console.log('   Validation errors:', response.body.details?.length || 0)
      return true
    } else {
      console.log('❌ Validation not working as expected')
      console.log('   Status:', response.status)
      return false
    }
  } catch (error) {
    console.log('❌ Error testing validation:', error.message)
    return false
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Beta Feedback System Tests\n')

  const results = {
    submission: await testFeedbackSubmission(),
    analytics: await testFeedbackAnalytics(),
    validation: await testValidation()
  }

  console.log('\n📋 Test Results:')
  console.log('   Submission:', results.submission ? '✅ PASS' : '❌ FAIL')
  console.log('   Analytics:', results.analytics ? '✅ PASS' : '❌ FAIL')
  console.log('   Validation:', results.validation ? '✅ PASS' : '❌ FAIL')

  const passed = Object.values(results).filter(Boolean).length
  const total = Object.keys(results).length

  console.log(`\n🎯 Overall: ${passed}/${total} tests passed`)

  if (passed === total) {
    console.log('🎉 All tests passed! Beta feedback system is ready.')
    process.exit(0)
  } else {
    console.log('⚠️  Some tests failed. Check configuration and try again.')
    process.exit(1)
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await makeRequest(BASE_URL, { method: 'GET' })
    return response.status < 500
  } catch (error) {
    return false
  }
}

// Run tests if server is available
checkServer().then(isRunning => {
  if (!isRunning) {
    console.log('❌ Server not running at', BASE_URL)
    console.log('   Please start the development server first:')
    console.log('   cd frontend && npm run dev')
    process.exit(1)
  }

  runTests()
}).catch(() => {
  console.log('❌ Cannot connect to server at', BASE_URL)
  process.exit(1)
})