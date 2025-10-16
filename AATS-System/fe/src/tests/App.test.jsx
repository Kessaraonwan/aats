import { render, screen } from '@testing-library/react';
import App from './App';

test('renders main app page', () => {
  render(<App />);
  const linkElement = screen.getByText(/สมัครงาน/i);
  expect(linkElement).toBeInTheDocument();
});
