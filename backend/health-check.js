const axios = require('axios');
const baseUrl = process.env.CTRL_TOWER_URL || 'http://dct.mitechnology.org';

(async () => {
  try {
    const stats = await axios.get(`${baseUrl}/api/stats`);
    if (!stats.data || !stats.data.ec2) throw new Error('Stats check failed');
    console.log('✅ Dashboard Stats API passed');
    process.exit(0);
  } catch (err) {
    console.error('❌ DevOps Control Tower health check failed:', err.message);
    process.exit(1);
  }
})();
