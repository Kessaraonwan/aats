import { render } from '@testing-library/react';
import Modal from '../../../../../components/shared/Modal';

test('renders modal', () => {
  render(<Modal open={true} onClose={() => {}} />);
});
