import axios from 'axios';

test('api call returns data', async () => {
  const response = await axios.get('/api/test');
  expect(response).toBeDefined();
});
