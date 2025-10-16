import { render } from '@testing-library/react';
import CandidateList from '../../components/candidate/CandidateList';

test('renders candidate list', () => {
  render(<CandidateList candidates={[]} />);
});
