import { render } from '@testing-library/react';
import ImageWithFallback from '../../../../../components/shared/ImageWithFallback';

test('renders image with fallback', () => {
  render(<ImageWithFallback src="test.jpg" alt="test" />);
});
