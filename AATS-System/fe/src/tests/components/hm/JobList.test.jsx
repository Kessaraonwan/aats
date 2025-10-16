import { render } from '@testing-library/react';
import JobList from '../../../../../components/hm/JobList';

test('renders job list', () => {
  render(<JobList jobs={[]} />);
});
