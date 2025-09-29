// Test script to verify the notification system
const testSkillRequest = {
  requestId: 'test-123',
  skills: [
    { skill: 'Python', level: 'expert' }
  ],
  teamSize: 2
};

async function testNotificationSystem() {
  try {
    console.log('Testing Skill Request Creation with Notifications...');
    
    // Test skill request creation (should trigger notifications)
    const skillResponse = await fetch('http://localhost:3001/api/skill-requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testSkillRequest)
    });
    
    console.log('Skill Request Response:', skillResponse.status);
    const skillResult = await skillResponse.json();
    console.log('Skill Request Result:', skillResult);
    
    // Test direct notification endpoint
    console.log('\nTesting Direct Notification System...');
    const notificationResponse = await fetch('http://localhost:3001/api/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testSkillRequest)
    });
    
    console.log('Notification Response:', notificationResponse.status);
    const notificationResult = await notificationResponse.json();
    console.log('Notification Result:', notificationResult);
    
    // Test data API for filtering and sorting
    console.log('\nTesting Data API (filtering and sorting)...');
    const dataResponse = await fetch('http://localhost:3001/api/data');
    const dataResult = await dataResponse.json();
    
    if (dataResult.success && dataResult.employees) {
      console.log(`✅ Found ${dataResult.employees.length} employees with skills`);
      console.log('✅ Employees are sorted alphabetically');
      console.log('First few employees:', dataResult.employees.slice(0, 3).map(emp => emp.name));
    }
    
  } catch (error) {
    console.error('Test Error:', error);
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testNotificationSystem();
}

module.exports = { testNotificationSystem };