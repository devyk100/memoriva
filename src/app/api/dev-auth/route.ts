import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json();
    
    // Create a mock session token (in a real app, this would be properly signed)
    const mockSession = {
      user: {
        email,
        name,
        image: null,
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    };

    // Create response and set cookie
    const response = NextResponse.json({ success: true });
    
    // Set a cookie to simulate NextAuth session
    response.cookies.set('next-auth.session-token', JSON.stringify(mockSession), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return response;
  } catch (error) {
    console.error('Dev auth error:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}
