import { render } from '@testing-library/react';
import Input from '../../../../../components/ui/Input';

test('renders input', () => {
  render(<Input value="" onChange={() => {}} />);
});
