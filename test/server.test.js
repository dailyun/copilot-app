import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { createServer } from '../src/server.js';

let server;
let baseUrl;

describe('server', () => {
  before(async () => {
    server = createServer();
    await new Promise((resolve) => server.listen(0, resolve));
    const { port } = server.address();
    baseUrl = `http://127.0.0.1:${port}`;
  });

  after(async () => {
    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  });

  it('returns health status', async () => {
    const response = await fetch(`${baseUrl}/api/health`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { status: 'ok' });
  });

  it('returns stalls for a search query', async () => {
    const response = await fetch(`${baseUrl}/api/stalls?q=laksa`);
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.length, 1);
    assert.equal(body[0].cuisine, 'Laksa');
  });
});
