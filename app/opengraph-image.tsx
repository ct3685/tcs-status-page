import { ImageResponse } from 'next/og';
import { markStandaloneSvg, toDataUri } from '@/components/brand/markSvg';

// Branded social preview (also used as the Twitter card image fallback).
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'TCS Repair — System Status';

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
          color: '#f6fbff',
          background:
            'radial-gradient(60% 65% at 50% 32%, rgba(0,174,239,0.14), rgba(7,17,31,0) 60%), linear-gradient(160deg, #0f1d2d 0%, #07111f 60%, #050d16 100%)',
        }}
      >
        <img width={320} height={308} src={mark} alt="" />
        <div style={{ display: 'flex', fontSize: 72, fontWeight: 700, letterSpacing: 16 }}>
          <span>TCS</span>
          <span style={{ color: '#00aeef', marginLeft: 26 }}>REPAIR</span>
        </div>
        <div style={{ fontSize: 24, letterSpacing: 10, color: '#aebdca' }}>SYSTEM STATUS</div>
      </div>
    ),
    { ...size },
  );
}
