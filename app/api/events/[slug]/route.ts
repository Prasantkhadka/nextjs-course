import connectToDatabase from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import Event from "@/database/event.model";

/**
 * GET /api/events/[slug]
 * Fetches a single event by its slug
 * 
 * @param request - Next.js request object
 * @param params - Route parameters containing the slug
 * @returns JSON response with event data or error message
 */

type RouteParams = {
    params: Promise<{slug: string;}>;
};

export async function GET(
  request: NextRequest,
  { params }:  RouteParams 
) {
  try {
    // Connect to database
    await connectToDatabase();

    // Extract slug from route parameters
    const { slug } = await params;

    // Validate slug parameter
    if (!slug || typeof slug !== 'string' || slug.trim() === '') {
      return NextResponse.json(
        { message: 'Invalid slug parameter', error: 'Slug must be a non-empty string' },
        { status: 400 }
      );
    }

    // Sanitize slug to prevent injection attacks
    const sanitizedSlug = slug.trim().toLowerCase();

    // Query event by slug
    const event = await Event.findOne({ slug: sanitizedSlug }).lean();

    // Handle event not found
    if (!event) {
      return NextResponse.json(
        { message: 'Event not found', error: `No event exists with slug: ${sanitizedSlug}` },
        { status: 404 }
      );
    }

    // Return successful response with event data
    return NextResponse.json(
      { message: 'Event retrieved successfully', event },
      { status: 200 }
    );
  } catch (error) {
    // Log error for debugging (in production, use proper logging service)
    console.error('Error fetching event by slug:', error);

    // Handle database connection errors
    if (error instanceof Error && error.message.includes('MONGODB_URI')) {
      return NextResponse.json(
        { message: 'Database configuration error', error: 'Unable to connect to database' },
        { status: 500 }
      );
    }

    // Handle Mongoose validation or cast errors
    if (error instanceof Error && error.name === 'CastError') {
      return NextResponse.json(
        { message: 'Invalid slug format', error: error.message },
        { status: 400 }
      );
    }

    // Handle unexpected errors
    return NextResponse.json(
      { message: 'Failed to retrieve event', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}