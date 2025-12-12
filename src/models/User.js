import mongoose, { Schema } from 'mongoose';

/**
 * User model to store Google OAuth tokens and user information
 * This allows us to persist authentication across sessions
 */
const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    // Google OAuth tokens
    googleAccessToken: {
      type: String,
      default: null,
    },
    googleRefreshToken: {
      type: String,
      default: null,
    },
    // Token expiration timestamp (in milliseconds)
    tokenExpiry: {
      type: Number,
      default: null,
    },
    // Google user ID
    googleId: {
      type: String,
      default: null,
    },
    // User's preferred/default site URL for SEO dashboard
    preferredSiteUrl: {
      type: String,
      default: null,
    },
    // Array of site URLs the user has access to
    connectedSites: [
      {
        siteUrl: String,
        siteName: String,
        verified: { type: Boolean, default: false },
        lastChecked: Date,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User || mongoose.model('User', UserSchema);

