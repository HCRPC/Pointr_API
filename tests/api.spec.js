const { test, expect } = require('@playwright/test');

// --- SITES TEST CASES ---
test('POST /sites - should create a site (positive)', async ({ request }) => {
  const res = await request.post('/sites', {
    data: { name: 'Test Site', location: 'Istanbul' },
  });
  expect(res.status()).toBe(201);
  const site = await res.json();
  expect(site.name).toBe('Test Site');
  expect(site.location).toBe('Istanbul');
  // Cleanup
  await request.delete(`/sites/${site.id}`);
});

test('POST /sites - missing required fields returns 400 (negative)', async ({ request }) => {
  const res = await request.post('/sites', {
    data: { location: 'Istanbul' }, // name eksik
  });
  expect(res.status()).toBe(400);
});

test('POST /sites - duplicate site returns 409 (negative)', async ({ request }) => {
  const data = { name: 'Unique Site', location: 'Izmir' };
  const res1 = await request.post('/sites', { data });
  expect(res1.status()).toBe(201);
  const res2 = await request.post('/sites', { data });
  expect(res2.status()).toBe(409);
  const site = await res1.json();
  // Cleanup
  await request.delete(`/sites/${site.id}`);
});

// --- BUILDINGS TEST CASES ---
test('POST /buildings - should create a building (positive)', async ({ request }) => {
  // Önce bir site oluştur
  const siteRes = await request.post('/sites', { data: { name: 'BldgSite', location: 'Ankara' } });
  const site = await siteRes.json();
  const res = await request.post('/buildings', {
    data: { site_id: site.id, name: 'Main Building' },
  });
  expect(res.status()).toBe(201);
  const building = await res.json();
  expect(building.name).toBe('Main Building');
  // Cleanup
  await request.delete(`/buildings/${building.id}`);
  await request.delete(`/sites/${site.id}`);
});

test('POST /buildings - missing required fields returns 400 (negative)', async ({ request }) => {
  const res = await request.post('/buildings', {
    data: { name: 'NoSiteId' }, // site_id eksik
  });
  expect(res.status()).toBe(400);
});

test('POST /buildings - duplicate building returns 409 (negative)', async ({ request }) => {
  // Önce bir site oluştur
  const siteRes = await request.post('/sites', { data: { name: 'DupBldgSite', location: 'Bursa' } });
  const site = await siteRes.json();
  const data = { site_id: site.id, name: 'DupBuilding' };
  const res1 = await request.post('/buildings', { data });
  expect(res1.status()).toBe(201);
  const res2 = await request.post('/buildings', { data });
  expect(res2.status()).toBe(409);
  const building = await res1.json();
  // Cleanup
  await request.delete(`/buildings/${building.id}`);
  await request.delete(`/sites/${site.id}`);
});

// --- LEVELS TEST CASES ---
test('POST /levels - should create levels (positive)', async ({ request }) => {
  // Önce bir site ve building oluştur
  const siteRes = await request.post('/sites', { data: { name: 'LvlSite', location: 'Adana' } });
  const site = await siteRes.json();
  const bldgRes = await request.post('/buildings', { data: { site_id: site.id, name: 'LvlBldg' } });
  const building = await bldgRes.json();
  const res = await request.post('/levels', {
    data: [
      { building_id: building.id, name: 'Ground', floor_number: 0 },
      { building_id: building.id, name: 'First', floor_number: 1 },
    ],
  });
  expect(res.status()).toBe(201);
  const levels = await res.json();
  expect(levels.length).toBe(2);
  // Cleanup
  for (const level of levels) {
    await request.delete(`/levels/${level.id}`);
  }
  await request.delete(`/buildings/${building.id}`);
  await request.delete(`/sites/${site.id}`);
});

test('POST /levels - missing required fields returns 400 (negative)', async ({ request }) => {
  const res = await request.post('/levels', {
    data: [
      { name: 'NoBuildingId', floor_number: 0 }, // building_id eksik
    ],
  });
  expect(res.status()).toBe(400);
});

test('POST /levels - duplicate level returns 409 (negative)', async ({ request }) => {
  // Önce bir site ve building oluştur
  const siteRes = await request.post('/sites', { data: { name: 'DupLvlSite', location: 'Samsun' } });
  const site = await siteRes.json();
  const bldgRes = await request.post('/buildings', { data: { site_id: site.id, name: 'DupLvlBldg' } });
  const building = await bldgRes.json();
  const data = [
    { building_id: building.id, name: 'DupLevel', floor_number: 0 },
  ];
  const res1 = await request.post('/levels', { data });
  expect(res1.status()).toBe(201);
  const res2 = await request.post('/levels', { data });
  expect(res2.status()).toBe(409);
  const levels = await res1.json();
  for (const level of levels) {
    await request.delete(`/levels/${level.id}`);
  }
  await request.delete(`/buildings/${building.id}`);
  await request.delete(`/sites/${site.id}`);
});
