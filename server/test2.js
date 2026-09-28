import fetch from 'node-fetch';

async function testApi() {
  // Register a user
  const res = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Test Doer',
      email: 'doer@test.com',
      phone: '123456',
      password: 'password123',
      role: 'doer'
    })
  });
  
  const data = await res.json();
  console.log('Register response:', data);
  
  if (data.success) {
    const token = data.data.token;
    
    // Update profile
    const updateRes = await fetch('http://localhost:5000/api/doers/profile', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        primarySkill: 'Plumber',
        yearsOfExperience: 5,
        serviceRadius: 10,
        biography: 'Expert plumber'
      })
    });
    
    const updateData = await updateRes.json();
    console.log('Update profile response:', updateData);
  }
}

testApi();
