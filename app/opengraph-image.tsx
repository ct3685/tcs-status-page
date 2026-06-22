import { ImageResponse } from 'next/og';
import { markStandaloneSvg, toDataUri } from '@/components/brand/markSvg';

// Branded social preview (also used as the Twitter card image fallback).
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Last Rev — System Status';

export default function OpengraphImage() {
  const mark = toDataUri(markStandaloneSvg('gold'));
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 40,
          color: '#F6F6F4',
          background:
            'radial-gradient(60% 65% at 50% 32%, rgba(200,169,106,0.10), rgba(10,10,10,0) 60%), linear-gradient(160deg, #141414 0%, #0A0A0A 60%, #060606 100%)',
        }}
      >
        <img width={520} height={280} src={mark} alt="" />
        <div style={{ display: 'flex', fontSize: 88, fontWeight: 700, letterSpacing: 20 }}>
          <span>LAST</span>
          <span style={{ color: '#C8A96A', marginLeft: 26 }}>REV</span>
        </div>
        <div style={{ fontSize: 26, letterSpacing: 14, color: '#9A9A9A' }}>
          BUILD. AUTOMATE. ACCELERATE.
        </div>
      </div>
    ),
    { ...size },
  );
}
