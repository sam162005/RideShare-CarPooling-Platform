const mongoose = require('mongoose');

const RideSchema = new mongoose.Schema({
  pickupPoint: {
    name: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    }
  },
  dropoffPoint: {
    name: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    }
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  passengerCount: {
    type: Number,
    required: true
  },
  pricePerSeat: {
    type: Number,
    required: true
  },
  selectedRoute: {
    distance: String,
    time: String,
    toll: Boolean
  },
  publishedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    default: 'active'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  }
});

module.exports = mongoose.model('ride', RideSchema);
