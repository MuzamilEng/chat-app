const Agenda = require('agenda');

const agenda = new Agenda({
  name: process.env.AGENDA_COLLECTION_NAME,
  maxConcurrency: process.env.AGENDA_MAX_CONCURRENCY,
  db: {
    address: process.env.MONGO_URI
  }
});

// agenda.on('success', job => console.info(`job "${job.attrs.name}" succeeded`));
agenda.on('fail', (err, job) => {
  // TODO - should move to log
  console.error(`job "${job.attrs.name}" failed: ${err.message}`, {
    extra: {
      job
    }
  });
});

module.exports = agenda;
