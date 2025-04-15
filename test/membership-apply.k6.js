import http from 'k6/http';
import { check, sleep } from 'k6';

// Load environment variables from .env-test
const env = {};
const envContent = open('./.env-test');
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=').map(s => s.trim());
  if (key && value) {
    env[key] = value;
  }
});

export const options = {
  vus: 1, // 1 virtual user
  iterations: 1, // 1 iteration
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests should complete within 2s
  },
};

const ROOT = env.API_URL;
const TOKEN = env.TEST_TOKEN;

export default function () {
  // Step 1: Apply for membership
  const membershipData = {
    // Group/duo email (required for group/duo membership)
    emailPic: 'riza.ramadan+duo1@gmail.com',
    
    // Membership duration (required)
    duration: '90', // 90 days (3 months)
    
    // Personal Information
    fullName: 'Riza Notif',
    nickname: 'duo satu',
    gender: 'male',
    dateOfBirth: '1990-01-01',
    address: 'Cipaganti',
    wa: '1123',
    identityNumber: '123',
    
    // Health Information
    healthConditionPreset: 'none',
    healthCondition: 'Saya dalam kondisi sehat untuk melakukan aktivitas fisik',
    
    // Parent Information (optional)
    parentName: '',
    parentIdentityNumber: '',
    parentContact: '',
    
    // Agreements
    termsAgree: 'on',
    riskAgree: 'on',
    dataAgree: 'on',
    rulesAgree: 'on',
    
    // Front Officer
    frontOfficer: 'Fuad'
  };

  const membershipRes = http.post(
    `${ROOT}/members/membership-apply`,
    membershipData,
    {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  );

  check(membershipRes, {
    'membership application status is 200': (r) => r.status === 200,
    'membership application successful': (r) => r.status === 200
  });

  console.log('Membership application response:', membershipRes.body);
  sleep(1);
} 