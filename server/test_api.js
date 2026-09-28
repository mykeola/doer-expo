import 'dotenv/config';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch'; 

const testEndpoint = async () => {
  const token = jwt.sign({ id: 1 }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
  const response = await fetch('http://127.0.0.1:5000/api/chat/5', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
};

testEndpoint();
