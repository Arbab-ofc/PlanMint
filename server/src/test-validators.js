import { validatePassword, validateEmail, validateUsername } from './utils/validators.js';

console.log('=== Testing Password Validator ===\n');

const passwordTests = [
  { password: 'MyPass123!', expected: true, description: 'Valid password' },
  { password: 'short1!', expected: false, description: 'Too short (< 8 chars)' },
  { password: 'nouppercas1!', expected: false, description: 'No uppercase letter' },
  { password: 'NOLOWERCASE1!', expected: false, description: 'No lowercase letter' },
  { password: 'NoNumber!', expected: false, description: 'No number' },
  { password: 'NoSpecial123', expected: false, description: 'No special character' },
  { password: 'Test@123', expected: true, description: 'Valid with @ symbol' },
  { password: 'Secure#Pass2024', expected: true, description: 'Valid long password' },
];

passwordTests.forEach(test => {
  const result = validatePassword(test.password);
  const status = result.isValid === test.expected ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} - ${test.description}`);
  console.log(`   Password: "${test.password}"`);
  console.log(`   Result: ${result.message}`);
  console.log('');
});

console.log('\n=== Testing Username Validator ===\n');


const usernameTests = [
  { username: 'john_doe', expected: true, description: 'Valid username with underscore' },
  { username: 'user123', expected: true, description: 'Valid username with numbers' },
  { username: 'ab', expected: false, description: 'Too short (< 3 chars)' },
  { username: 'thisusernameiswaytoolong123', expected: false, description: 'Too long (> 20 chars)' },
  { username: 'user@name', expected: false, description: 'Invalid character (@)' },
  { username: 'User_Name', expected: true, description: 'Valid (will be lowercased)' },
  { username: '_username', expected: false, description: 'Starts with underscore' },
  { username: 'username_', expected: false, description: 'Ends with underscore' },
];

usernameTests.forEach(test => {
  const result = validateUsername(test.username);
  const status = result === test.expected ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} - ${test.description}`);
  console.log(`   Username: "${test.username}"`);
  console.log(`   Valid: ${result}`);
  console.log('');
});

console.log('\n=== Testing Email Validator ===\n');


const emailTests = [
  { email: 'user@example.com', expected: true, description: 'Valid email' },
  { email: 'test.user@domain.co.in', expected: true, description: 'Valid email with subdomain' },
  { email: 'invalid@', expected: false, description: 'Missing domain' },
  { email: '@example.com', expected: false, description: 'Missing username' },
  { email: 'notanemail', expected: false, description: 'No @ symbol' },
  { email: 'user@domain', expected: false, description: 'Missing TLD' },
];

emailTests.forEach(test => {
  const result = validateEmail(test.email);
  const status = result === test.expected ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} - ${test.description}`);
  console.log(`   Email: "${test.email}"`);
  console.log(`   Valid: ${result}`);
  console.log('');
});

console.log('\n=== All Tests Completed ===');
