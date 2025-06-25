const axios = require('axios');

export default async function handler(req, res) {
  const { assetId } = req.query;
  if (!assetId) return res.status(400).json({ error: 'Missing assetId' });

  try {
    const response = await axios.get(`https://economy.roproxy.com/v2/assets/${assetId}/details`);
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error from Roproxy:', error.message);
    res.status(500).json({ error: 'Failed to fetch from Roproxy' });
  }
}
