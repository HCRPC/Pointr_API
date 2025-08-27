# Campus API (Express + PostgreSQL + Docker + Playwright)

## Quick Start
```bash
docker-compose up --build
# in another terminal
npm install
npx playwright install
npm test
```

- API: `http://localhost:3000`
- Health: `GET /`

## Endpoints
- **Sites**
  - `POST /sites` `{ name, location? }`
  - `GET /sites/:id`
  - `DELETE /sites/:id`
- **Buildings**
  - `POST /buildings` `{ site_id, name }`
  - `GET /buildings/:id`
  - `DELETE /buildings/:id`
- **Levels**
  - `POST /levels` body can be an object or an array of objects `{ building_id, name, floor_number? }`

## Notes
- DB credentials are set in `docker-compose.yml` and used by `db.js`.
- Tables are created by `sql/init.sql` on first DB start.
