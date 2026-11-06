import type { ImgHTMLAttributes } from 'react';

type Props = ImgHTMLAttributes<HTMLImageElement> & {
  fill?: boolean; priority?: boolean; unoptimized?: boolean; quality?: number;
};
export default function Image({ fill, priority, unoptimized: _unoptimized, quality: _quality, style, ...props }: Props) {
  return <img {...props} loading={priority ? 'eager' : (props.loading ?? 'lazy')}
    fetchPriority={priority ? 'high' : undefined}
    style={fill ? { position: 'absolute', height: '100%', width: '100%', inset: 0, ...style } : style} />;
}
