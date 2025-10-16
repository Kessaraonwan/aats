import { renderHook } from '@testing-library/react-hooks';
import useCandidateData from '../../hooks/useCandidateData';

test('useCandidateData returns initial state', () => {
  const { result } = renderHook(() => useCandidateData());
  expect(result.current.candidates).toBeDefined();
});
