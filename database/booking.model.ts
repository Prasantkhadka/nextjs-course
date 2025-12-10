import mongoose, { Schema, Document, Model, Types, CallbackError } from 'mongoose';
import Event from './event.model';

/**
 * TypeScript interface for Booking document
 * Extends Mongoose Document to include all schema fields with proper types
 */
export interface IBooking extends Document {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Email validation regex pattern
 * Validates standard email format: username@domain.extension
 */
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const bookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      validate: {
        validator: (email: string) => emailRegex.test(email),
        message: 'Please provide a valid email address',
      },
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

/**
 * Pre-save hook to verify the referenced event exists
 * Prevents orphaned bookings by validating eventId before saving
 */
bookingSchema.pre('save', async function () {
  // Only validate eventId if it's new or modified
  if (this.isNew || this.isModified('eventId')) {
    const eventExists = await Event.findById(this.eventId);
    
    if (!eventExists) {
      throw new Error(`Event with ID ${this.eventId} does not exist`);
    }
  }
});

// Create index on eventId for faster queries and event-based lookups
bookingSchema.index({ eventId: 1 });

// Compound index for checking duplicate bookings (same email for same event)
bookingSchema.index({ eventId: 1, email: 1 });

// Export the model, reusing existing model if it exists (prevents recompilation issues in development)
const Booking: Model<IBooking> = mongoose.models.Booking || mongoose.model<IBooking>('Booking', bookingSchema);

export default Booking;
