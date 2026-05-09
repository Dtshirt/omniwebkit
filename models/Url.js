import mongoose from 'mongoose';

const UrlSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  originalUrl: {
    type: String,
    required: true,
    trim: true,
  },
  userId: {
    type: String,
    default: null,   // anonymous userId generated client-side (UUID v4)
    trim: true,
    index: true,     // fast per-user queries
  },
  clicks: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    default: null, // Optional TTL
  }
});

// Ensure the TTL index works if expiresAt is set
UrlSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.Url || mongoose.model('Url', UrlSchema);
