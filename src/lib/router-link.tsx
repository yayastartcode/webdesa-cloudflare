import { Link, type LinkProps } from 'react-router-dom';
export default function RouterLink({ href, ...props }: Omit<LinkProps, 'to'> & { href: string }) {
  return <Link to={href} {...props} />;
}
