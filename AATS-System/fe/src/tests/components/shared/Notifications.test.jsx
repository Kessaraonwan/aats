import { render } from '@testing-library/react';
import Notifications from '../../../../../components/shared/Notifications';

test('renders notifications', () => {
  render(<Notifications notifications={[]} />);
});
