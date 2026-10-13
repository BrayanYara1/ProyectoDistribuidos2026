const express = require('express');
const WorkflowEngine = require('./services/WorkflowEngine');

const app = express();
app.use(express.json());
const engine = new WorkflowEngine();

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'appt-mgmt-workflow' });
});

app.post('/api/v1/workflow/transition', (req, res) => {
  try {
    const { appointment, targetStatus } = req.body;
    if (!appointment || !targetStatus) {
      return res.status(400).json({ error: 'Missing required request parameters' });
    }
    const result = engine.processTransition(appointment, targetStatus);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3003;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Workflow Service running on port ${PORT}`);
  });
}

module.exports = app;
