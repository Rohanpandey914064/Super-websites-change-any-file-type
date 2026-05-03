const express = require('express');
const router = express.Router();
const { conversionQueue } = require('../services/queueService');

router.get('/:jobId', async (req, res) => {
  try {
    const job = await conversionQueue.getJob(req.params.jobId);

    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    const state = await job.getState();
    const progress = job.progress;
    
    let result = null;
    let error = null;

    if (state === 'completed') {
      result = job.returnvalue;
      // Inject download URL
      if (result) {
        result.downloadUrl = `/api/download/${job.data.outputId}`;
      }
    } else if (state === 'failed') {
      error = job.failedReason;
    }

    res.json({
      success: true,
      jobId: job.id,
      state,
      progress,
      result,
      error
    });

  } catch (error) {
    console.error('Status route error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch job status' });
  }
});

module.exports = router;
