import { ImageResponse } from 'next/og';
import { appIconSvg, toDataUri } from '@/components/brand/markSvg';

// Apple touch icon — iOS expects a PNG, so render the mark tile via next/og.
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ display: 'flex', width: '100%', height: '100%' }}>
        <img
          width={180}
          height={180}
          alt="Last Rev"
          src={toDataUri(appIconSvg('gold', { radius: 96 }))}
        />
      </div>
    ),
    { ...size },
  );
}
