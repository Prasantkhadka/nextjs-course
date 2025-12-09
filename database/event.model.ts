import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * TypeScript interface for Event document
 * Extends Mongoose Document to include all schema fields with proper types
 */
export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Generates a URL-friendly slug from a title
 * Converts to lowercase, replaces spaces with hyphens, removes special characters
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/--+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Validates and normalizes date string to ISO format (YYYY-MM-DD)
 * Accepts various date formats and returns standardized format
 */
function normalizeDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date format');
  }
  return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
}

/**
 * Normalizes time to 24-hour format (HH:MM)
 * Accepts various time formats and returns standardized format
 */
function normalizeTime(timeStr: string): string {
  // Remove extra spaces and convert to uppercase for AM/PM parsing
  const cleaned = timeStr.trim().toUpperCase();
  
  // If already in 24-hour format (HH:MM), validate and return
  const time24Regex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
  if (time24Regex.test(cleaned)) {
    return cleaned;
  }
  
  // Parse 12-hour format with AM/PM
  const time12Regex = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i;
  const match = cleaned.match(time12Regex);
  
  if (match) {
    let hours = parseInt(match[1]);
    const minutes = match[2];
    const period = match[3];
    
    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }
    
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  }
  
  throw new Error('Invalid time format. Use HH:MM or HH:MM AM/PM');
}

const eventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
    },
    overview: {
      type: String,
      required: [true, 'Event overview is required'],
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Event image is required'],
    },
    venue: {
      type: String,
      required: [true, 'Event venue is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Event location is required'],
      trim: true,
    },
    date: {
      type: String,
      required: [true, 'Event date is required'],
    },
    time: {
      type: String,
      required: [true, 'Event time is required'],
    },
    mode: {
      type: String,
      required: [true, 'Event mode is required'],
      enum: {
        values: ['online', 'offline', 'hybrid'],
        message: 'Mode must be online, offline, or hybrid',
      },
      lowercase: true,
    },
    audience: {
      type: String,
      required: [true, 'Target audience is required'],
      trim: true,
    },
    agenda: {
      type: [String],
      required: [true, 'Event agenda is required'],
      validate: {
        validator: (arr: string[]) => arr.length > 0,
        message: 'Agenda must contain at least one item',
      },
    },
    organizer: {
      type: String,
      required: [true, 'Event organizer is required'],
      trim: true,
    },
    tags: {
      type: [String],
      required: [true, 'Event tags are required'],
      validate: {
        validator: (arr: string[]) => arr.length > 0,
        message: 'At least one tag is required',
      },
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

/**
 * Pre-save hook for slug generation and date/time normalization
 * Only regenerates slug when title is modified
 */
eventSchema.pre('save', function (next) {
  // Generate slug only if title is new or modified
  if (this.isModified('title')) {
    this.slug = generateSlug(this.title);
  }
  
  // Normalize date to ISO format if modified
  if (this.isModified('date')) {
    try {
      this.date = normalizeDate(this.date);
    } catch (error) {
      return next(error as Error);
    }
  }
  
  // Normalize time to 24-hour format if modified
  if (this.isModified('time')) {
    try {
      this.time = normalizeTime(this.time);
    } catch (error) {
      return next(error as Error);
    }
  }
  
  next();
});

// Create unique index on slug for faster lookups and uniqueness enforcement
eventSchema.index({ slug: 1 }, { unique: true });

// Additional indexes for common queries
eventSchema.index({ date: 1 });
eventSchema.index({ tags: 1 });

// Export the model, reusing existing model if it exists (prevents recompilation issues in development)
const Event: Model<IEvent> = mongoose.models.Event || mongoose.model<IEvent>('Event', eventSchema);

export default Event;
