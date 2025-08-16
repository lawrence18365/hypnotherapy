// API endpoint for tracking marketing consent
// This would typically store in your database
// For now, we'll create a simple tracking system

export async function POST(request: Request) {
  try {
    const { email, consent, userId } = await request.json()
    
    // In a real app, you'd save this to your database
    // For now, this is just a logging endpoint
    console.log('Marketing Consent Received:', {
      email,
      consent,
      userId,
      timestamp: new Date().toISOString()
    })
    
    return Response.json({ 
      success: true, 
      message: 'Marketing consent recorded' 
    })
  } catch (error) {
    console.error('Error recording marketing consent:', error)
    return Response.json({ 
      success: false, 
      error: 'Failed to record consent' 
    }, { status: 500 })
  }
}

// GET endpoint to retrieve marketing consent data
export async function GET() {
  try {
    // In a real app, you'd fetch from your database
    // For now, return sample data structure
    const sampleData = [
      {
        id: 1,
        email: 'user@example.com',
        consent: true,
        timestamp: new Date().toISOString(),
        source: 'signup'
      }
    ]
    
    return Response.json({ 
      success: true, 
      data: sampleData 
    })
  } catch (error) {
    console.error('Error fetching marketing consent:', error)
    return Response.json({ 
      success: false, 
      error: 'Failed to fetch consent data' 
    }, { status: 500 })
  }
}
