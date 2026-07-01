import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, message, inquiryType } = body

    // Validate
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Send email via Resend (free tier available)
    // For now, just return success
    // In production, integrate with Resend, SendGrid, or similar
    
    console.log('Contact form submission:', {
      name,
      email,
      message,
      inquiryType,
      timestamp: new Date().toISOString()
    })

    // Email would go to: xmanart77@gmail.com
    // This is a placeholder - integrate with email service as needed

    return NextResponse.json(
      { success: true, message: 'Form submitted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
