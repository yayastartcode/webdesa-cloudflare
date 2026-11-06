import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
export { useParams } from 'react-router-dom';

export function useRouter() {
  const navigate = useNavigate();
  return useMemo(() => ({
    push: (path: string) => navigate(path),
    replace: (path: string) => navigate(path, { replace: true }),
    back: () => navigate(-1),
  }), [navigate]);
}
export function redirect(path: string): never {
  window.location.replace(path);
  throw new Error('Redirecting');
}
