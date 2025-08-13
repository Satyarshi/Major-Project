const mongoose = require('mongoose');

const mappingSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  mappings: [
    {
      co: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseOutcome' },
      poScores: {
        PO1: Number,
        PO2: Number,
        PO3: Number,
        PO4: Number,
        PO5: Number,
        PO6: Number,
        PO7: Number,
        PO8: Number,
        PO9: Number,
        PO10: Number,
        PO11: Number,
        PO12: Number
      }
    }
  ]
});

module.exports = mongoose.model('COPOMapping', mappingSchema); 