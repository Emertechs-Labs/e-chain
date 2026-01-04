import fetch from 'node-fetch';
import { ipfsToHttp } from '../../lib/metadata.js';

// Mock localStorage for node environment
const localStorageMock = {
    getItem: () => null,
    setItem: () => { },
    removeItem: () => { }
};
global.localStorage = localStorageMock;

async function testMetadataFetch() {
    console.log('🧪 Testing Metadata Fetch Improvements...\n');

    const testCases = [
        {
            name: 'Direct HTTP URL (Pinata)',
            uri: 'https://gateway.pinata.cloud/ipfs/bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
            expectedType: 'direct'
        },
        {
            name: 'IPFS URI (Gateway Fallback)',
            uri: 'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
            expectedType: 'gateway'
        }
    ];

    for (const test of testCases) {
        console.log(`Testing: ${test.name}`);
        console.log(`URI: ${test.uri}`);

        const url = ipfsToHttp(test.uri, 0);
        console.log(`Converted URL (direct check): ${url}`);

        try {
            const response = await fetch(url, { timeout: 5000 });
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Success! Fetched metadata:', JSON.stringify(data).slice(0, 100) + '...');
            } else {
                console.warn(`⚠️ Failed to fetch (Status ${response.status})`);
            }
        } catch (error) {
            console.error(`❌ Error fetching: ${error.message}`);
        }
        console.log('-'.repeat(40));
    }
}

testMetadataFetch();
