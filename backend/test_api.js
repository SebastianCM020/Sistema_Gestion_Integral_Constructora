async function test() {
  try {
    const loginRes = await fetch('http://localhost:3001/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'residente@icaro.dev', password: 'residente123' })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log("Logged in as Residente:", token.substring(0, 20) + "...");
    
    const projRes = await fetch('http://localhost:3001/api/v1/proyectos', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const projData = await projRes.json();
    console.log("Proyectos for residente:", projData.data.length);
  } catch(e) {
    console.error(e);
  }
}
test();
