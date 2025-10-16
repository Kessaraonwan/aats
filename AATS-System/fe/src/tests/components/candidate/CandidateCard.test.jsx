import { render, screen } from '@testing-library/react';
import CandidateCard from '../../../../../components/candidate/CandidateCard';

test('renders candidate name', () => {
  render(<CandidateCard name="Alice" />);
  expect(screen.getByText(/Alice/i)).toBeInTheDocument();
});
