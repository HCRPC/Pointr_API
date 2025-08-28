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

test('GET /sites/:id - should get a site by id (positive)', async ({ request }) => {
  const data = { name: 'GetByIdSite', location: 'Trabzon' };
  const createRes = await request.post('/sites', { data });
  expect(createRes.status()).toBe(201);
  const createdSite = await createRes.json();

  const res = await request.get(`/sites/${createdSite.id}`);
  expect(res.status()).toBe(200);
  const site = await res.json();
  expect(site.id).toBe(createdSite.id);
  expect(site.name).toBe(data.name);

  // Cleanup
  await request.delete(`/sites/${createdSite.id}`);
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

test('GET /buildings/:id - should get a building by id (positive)', async ({ request }) => {
  // Önce bir site ve building oluştur
  const siteData = { name: 'BldgGetByIdSite', location: 'Kayseri' };
  const siteRes = await request.post('/sites', { data: siteData });
  expect(siteRes.status()).toBe(201);
  const site = await siteRes.json();
  const bldgData = { site_id: site.id, name: 'GetByIdBuilding' };
  const bldgRes = await request.post('/buildings', { data: bldgData });
  expect(bldgRes.status()).toBe(201);
  const building = await bldgRes.json();

  // Get building by id
  const res = await request.get(`/buildings/${building.id}`);
  expect(res.status()).toBe(200);
  const bldg = await res.json();
  expect(bldg.id).toBe(building.id);
  expect(bldg.name).toBe(bldgData.name);

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
