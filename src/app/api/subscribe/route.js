import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(request) {
  try {
    console.log('Request received at:', new Date().toISOString());
    
    const { email } = await request.json().catch(() => {
      throw new Error('Invalid JSON payload');
    });
    
    console.log('Processing email:', email);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.log('Invalid email format:', email);
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    console.log('Attempting to connect to MongoDB...');
    let client;
    try {
      client = await clientPromise;
      console.log('Successfully connected to MongoDB');
    } catch (dbError) {
      console.error('MongoDB connection error:', dbError);
      throw new Error('Failed to connect to database');
    }

    const db = client.db('waitlist');
    console.log('Using database:', db.databaseName);

    console.log('Checking for existing email...');
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      console.log('Email already exists:', email);
      return NextResponse.json(
        { message: 'This email is already subscribed!' },
        { status: 200 }
      );
    }

    console.log('Inserting new subscriber...');
    const result = await db.collection('users').insertOne({
      email,
      createdAt: new Date(),
      project: 'manageyoursaas',
      status: 'pending'
    });
    console.log('Insert result:', result);

    return NextResponse.json(
      { message: 'Successfully subscribed to the waitlist!' },
      { status: 201 }
    );

  } catch (error) {
    console.error('API Error:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to process subscription',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// Add a simple GET handler for testing
export async function GET() {
  return NextResponse.json({ status: 'API is running' });
}