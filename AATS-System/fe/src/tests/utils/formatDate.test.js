import { formatDate } from '../../utils/formatDate';

test('formatDate returns string', () => {
  expect(typeof formatDate(new Date())).toBe('string');
});
