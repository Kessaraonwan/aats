import { render, screen } from '@testing-library/react';
import Navigation from '../../../../../components/shared/Navigation';

test('renders navigation', () => {
  render(<Navigation />);
  expect(screen.getByRole('navigation')).toBeInTheDocument();
});
