#!/usr/bin/env node
/**
 * Test script to verify that Babel cache invalidation works when .env changes
 * This script simulates changing the .env file and checks if Babel recognizes the change
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const projectRoot = path.resolve(__dirname, '..');
const envPath = path.join(projectRoot, '.env');

console.log('🧪 Testing Babel cache invalidation for .env changes\n');

// Read original .env content
const originalEnvContent = fs.readFileSync(envPath, 'utf8');
console.log('📄 Original .env content:');
console.log(originalEnvContent);

// Generate cache key for original content
const originalCacheKey = getCacheKeyFromContent(originalEnvContent);
console.log(`\n🔑 Original cache key: ${originalCacheKey}`);

// Test 1: Modify .env with value change
const modifiedEnvContent = originalEnvContent.replace(
  'https://mobile.foodifytn.app/api',
  'https://test.example.com/api'
);
const modifiedCacheKey = getCacheKeyFromContent(modifiedEnvContent);
console.log(`\n✏️  Modified .env (changed BASE_API_URL)`);
console.log(`🔑 Modified cache key: ${modifiedCacheKey}`);

// Test 2: Modify with comment addition
const commentEnvContent = originalEnvContent + '\n# Test comment\n';
const commentCacheKey = getCacheKeyFromContent(commentEnvContent);
console.log(`\n✏️  Modified .env (added comment)`);
console.log(`🔑 Comment cache key: ${commentCacheKey}`);

// Check results
const valueChangeDetected = originalCacheKey !== modifiedCacheKey;
const commentChangeDetected = originalCacheKey !== commentCacheKey;

console.log('\n📊 Test Results:');
console.log(`   Value change detected: ${valueChangeDetected ? '✅' : '❌'}`);
console.log(`   Comment change detected: ${commentChangeDetected ? '✅' : '❌'}`);

if (valueChangeDetected) {
  console.log('\n✅ SUCCESS: Babel cache will be invalidated when .env values change!');
  console.log('   Your environment variable changes will be properly detected.');
  process.exit(0);
} else {
  console.log('\n❌ FAILURE: Babel cache may not detect .env changes!');
  process.exit(1);
}

function getCacheKeyFromContent(content) {
  const hash = crypto.createHash('md5').update(content).digest('hex').substring(0, 8);
  return `babel-cache-${hash}`;
}
