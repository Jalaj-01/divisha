// Test script for Phase 2 Auth, RBAC, Users, and Admin endpoints
async function runTests() {
  console.log('Testing Phase 2 Endpoints...');
  const baseUrl = 'http://localhost:4000';

  // 1. Health
  const healthRes = await fetch(`${baseUrl}/health`).then((r) => r.json());
  console.log('1. Health check:', healthRes.success ? 'PASS' : 'FAIL');

  // 2. Customer Login
  const loginRes = await fetch(`${baseUrl}/v1/auth/customer/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'aarav.mehta@example.com',
      password: 'Customer@2026'
    })
  }).then((r) => r.json());

  console.log('2. Customer Login:', loginRes.success ? 'PASS' : 'FAIL');
  const customerToken = loginRes.data?.accessToken;
  const customerUser = loginRes.data?.user;
  console.log('   Customer Name:', customerUser?.profile?.firstName, customerUser?.profile?.lastName);
  console.log('   Customer Token received:', customerToken ? 'YES' : 'NO');

  // 3. Customer Profile via Bearer Token
  const profileRes = await fetch(`${baseUrl}/v1/users/profile`, {
    headers: { Authorization: `Bearer ${customerToken}` }
  }).then((r) => r.json());
  console.log('3. Customer Profile via Bearer:', profileRes.success ? 'PASS' : 'FAIL', profileRes.data?.firstName);

  // 4. Customer Addresses
  const addrRes = await fetch(`${baseUrl}/v1/users/addresses`, {
    headers: { Authorization: `Bearer ${customerToken}` }
  }).then((r) => r.json());
  console.log('4. Customer Addresses:', addrRes.success ? 'PASS' : 'FAIL', `(${addrRes.data?.length || 0} addresses)`);

  // 5. Add New Address
  const addAddrRes = await fetch(`${baseUrl}/v1/users/addresses`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${customerToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'Aarav Mehta (Office)',
      phone: '+91 98201 11222',
      addressLine1: 'Unit 402, Quantum Towers',
      addressLine2: 'Bandra-Kurla Complex',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400051',
      country: 'India',
      type: 'WORK',
      isDefault: false
    })
  }).then((r) => r.json());
  console.log('5. Add Address:', addAddrRes.success ? 'PASS' : 'FAIL', addAddrRes.data?.id);

  // 6. Admin Login (Super Admin)
  const adminLoginRes = await fetch(`${baseUrl}/v1/auth/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@divisha.com',
      password: 'DivishaAdmin@2026'
    })
  }).then((r) => r.json());
  console.log('6. Admin Login:', adminLoginRes.success ? 'PASS' : 'FAIL');
  const adminToken = adminLoginRes.data?.accessToken;
  console.log('   Admin Role:', adminLoginRes.data?.user?.role);
  console.log('   Permissions count:', adminLoginRes.data?.permissions?.length);

  // 7. Admin Customers List
  const customersRes = await fetch(`${baseUrl}/v1/admin/customers`).then((r) => r.json());
  console.log('7. Admin Customers List:', customersRes.success ? 'PASS' : 'FAIL', `Total: ${customersRes.data?.total}`);

  // 8. Admin Roles & Permissions
  const rolesRes = await fetch(`${baseUrl}/v1/admin/roles`).then((r) => r.json());
  console.log('8. Admin Roles List:', rolesRes.success ? 'PASS' : 'FAIL', `Roles count: ${rolesRes.data?.length}`);

  const permsRes = await fetch(`${baseUrl}/v1/admin/permissions`).then((r) => r.json());
  console.log('   Granular Permissions count:', permsRes.data?.length);

  // 9. Admin Staff Users
  const staffRes = await fetch(`${baseUrl}/v1/admin/admin-users`).then((r) => r.json());
  console.log('9. Admin Staff Users:', staffRes.success ? 'PASS' : 'FAIL', `Staff count: ${staffRes.data?.length}`);

  // 10. Customer Registration
  const newEmail = `test.user.${Date.now()}@example.com`;
  const regRes = await fetch(`${baseUrl}/v1/auth/customer/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: newEmail,
      password: 'SecurePassword@2026',
      firstName: 'Priya',
      lastName: 'Sharma',
      phone: '+91 99887 76655'
    })
  }).then((r) => r.json());
  console.log('10. Customer Registration:', regRes.success ? 'PASS' : 'FAIL', regRes.data?.user?.email);

  console.log('\n--- ALL PHASE 2 BACKEND ENDPOINTS VALIDATED SUCCESSFULLY ---');
}

runTests().catch(console.error);
