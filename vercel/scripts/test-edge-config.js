#!/usr/bin/env node

/**
 * Test Edge Config Setup
 *
 * This script tests the Edge Config connection and displays current data.
 * Run with: node scripts/test-edge-config.js
 */

import { get, getAll } from '@vercel/edge-config';

async function testEdgeConfig() {
  console.log('🔍 Testing Vercel Edge Config Connection...\n');

  try {
    // Test connection by getting all items
    console.log('📊 Fetching all Edge Config items...');
    const allItems = await getAll();

    if (!allItems || Object.keys(allItems).length === 0) {
      console.log('⚠️  Edge Config is empty. Run refresh-renewal-data to populate.');
      return;
    }

    console.log('✅ Edge Config connected successfully!\n');
    console.log('📦 Available keys:', Object.keys(allItems).join(', '));
    console.log('');

    // Check for renewal data
    const renewalData = await get('renewal_data');
    if (renewalData) {
      console.log('✅ Renewal data found!');
      console.log('   - Total apps:', renewalData.stats?.totalApps || 'Unknown');
      console.log('   - Divisions:', Object.keys(renewalData).filter(k => k !== 'stats').join(', '));
    } else {
      console.log('⚠️  No renewal_data key found in Edge Config');
    }

    // Check last updated timestamp
    const lastUpdated = await get('last_updated');
    if (lastUpdated) {
      const date = new Date(lastUpdated);
      const minutesAgo = Math.floor((Date.now() - date.getTime()) / 60000);
      console.log('   - Last updated:', date.toLocaleString());
      console.log(`   - Updated ${minutesAgo} minute(s) ago`);
    } else {
      console.log('⚠️  No last_updated timestamp found');
    }

    console.log('\n✅ Edge Config test complete!\n');

  } catch (error) {
    console.error('❌ Error testing Edge Config:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Verify EDGE_CONFIG environment variable is set');
    console.error('2. Run: vercel env pull');
    console.error('3. Check Edge Config exists in Vercel dashboard\n');
    process.exit(1);
  }
}

testEdgeConfig();
