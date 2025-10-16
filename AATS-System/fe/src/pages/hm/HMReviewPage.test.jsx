import { render, screen } from '@testing-library/react';
import HMReviewPage from './HMReviewPage';

test('renders HM review page', () => {
  render(<HMReviewPage />);
  expect(screen.getByText(/Review/i)).toBeInTheDocument();
});
