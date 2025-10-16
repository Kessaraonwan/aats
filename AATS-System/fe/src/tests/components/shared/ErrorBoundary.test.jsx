import { render } from '@testing-library/react';
import ErrorBoundary from '../../../../../components/shared/ErrorBoundary';

test('renders error boundary', () => {
  render(<ErrorBoundary><div>Test</div></ErrorBoundary>);
});
