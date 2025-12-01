import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Subscriber from '@/models/Subscriber';

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    await dbConnect();

    const existing = await Subscriber.findOne({ email });
    if (existing) {
      return NextResponse.json({ message: 'Email already registered' }, { status: 200 });
    }

    await Subscriber.create({ email });

    return NextResponse.json({ message: 'Email stored successfully' }, { status: 201 });
  } catch (error) {
    console.error('Failed to save email', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

