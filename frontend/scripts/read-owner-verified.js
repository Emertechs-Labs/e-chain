import('./lib/multibaas.js').then(async ({ callContractRead }) => {
  try {
    const alias = 'eventfactory1';
    console.log('Calling owner() on', alias);
    const owner = await callContractRead(alias, alias, 'owner', []);
    console.log('owner:', owner);
    const isVerified = await callContractRead(alias, alias, 'isVerifiedOrganizer', [owner]);
    console.log('isVerifiedOrganizer:', isVerified);
  } catch (e) {
    console.error('ERR', e?.response?.data ?? e.message ?? e);
    process.exit(1);
  }
}).catch(e=>{console.error('Import err',e);process.exit(1)});
