import React from 'react';
import { Composition } from 'remotion';
import { ThunderPortalLogo } from './ThunderPortalLogo';
import { ThunderPortalLogoSimple } from './ThunderPortalLogoSimple';
import { ThunderPortalLogoPro } from './ThunderPortalLogoPro';
import { ThunderPortalLogoMinimal } from './ThunderPortalLogoMinimal';
import { ThunderPortalLogoUltimate } from './ThunderPortalLogoUltimate';
import { ThunderPortalLogoProFinal } from './ThunderPortalLogoProFinal';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Original versions */}
      <Composition
        id="ThunderPortalLogo"
        component={ThunderPortalLogo}
        durationInFrames={1}
        fps={30}
        width={1024}
        height={1024}
      />
      <Composition
        id="ThunderPortalLogoSquare"
        component={ThunderPortalLogo}
        durationInFrames={1}
        fps={30}
        width={512}
        height={512}
      />
      <Composition
        id="ThunderPortalLogoBanner"
        component={ThunderPortalLogo}
        durationInFrames={1}
        fps={30}
        width={1920}
        height={500}
        defaultProps={{ banner: true }}
      />
      <Composition
        id="ThunderPortalLogoIcon"
        component={ThunderPortalLogoSimple}
        durationInFrames={1}
        fps={30}
        width={512}
        height={512}
      />
      
      {/* Pro versions */}
      <Composition
        id="ThunderPortalLogoPro"
        component={ThunderPortalLogoPro}
        durationInFrames={1}
        fps={30}
        width={800}
        height={800}
        defaultProps={{ variant: 'dark', showText: true }}
      />
      <Composition
        id="ThunderPortalLogoProIcon"
        component={ThunderPortalLogoPro}
        durationInFrames={1}
        fps={30}
        width={512}
        height={512}
        defaultProps={{ variant: 'dark', showText: false }}
      />
      
      {/* Minimal versions */}
      <Composition
        id="ThunderPortalLogoMinimal"
        component={ThunderPortalLogoMinimal}
        durationInFrames={1}
        fps={30}
        width={512}
        height={512}
        defaultProps={{ variant: 'dark' }}
      />
      <Composition
        id="ThunderPortalLogoMinimalLight"
        component={ThunderPortalLogoMinimal}
        durationInFrames={1}
        fps={30}
        width={512}
        height={512}
        defaultProps={{ variant: 'light' }}
      />
      
      {/* Ultimate versions */}
      <Composition
        id="ThunderPortalLogoUltimate"
        component={ThunderPortalLogoUltimate}
        durationInFrames={1}
        fps={30}
        width={1024}
        height={800}
        defaultProps={{ showText: true, variant: 'color' }}
      />
      <Composition
        id="ThunderPortalLogoUltimateIcon"
        component={ThunderPortalLogoUltimate}
        durationInFrames={1}
        fps={30}
        width={512}
        height={512}
        defaultProps={{ showText: false, variant: 'color' }}
      />
      <Composition
        id="ThunderPortalLogoUltimateMono"
        component={ThunderPortalLogoUltimate}
        durationInFrames={1}
        fps={30}
        width={512}
        height={512}
        defaultProps={{ showText: false, variant: 'mono' }}
      />
      
      {/* Final Pro versions - All formats */}
      <Composition
        id="Logo"
        component={ThunderPortalLogoProFinal}
        durationInFrames={1}
        fps={30}
        width={1024}
        height={1024}
        defaultProps={{ variant: 'transparent', showText: true, format: 'square' }}
      />
      <Composition
        id="LogoDark"
        component={ThunderPortalLogoProFinal}
        durationInFrames={1}
        fps={30}
        width={1024}
        height={1024}
        defaultProps={{ variant: 'dark', showText: true, format: 'square' }}
      />
      <Composition
        id="LogoLight"
        component={ThunderPortalLogoProFinal}
        durationInFrames={1}
        fps={30}
        width={1024}
        height={1024}
        defaultProps={{ variant: 'light', showText: true, format: 'square' }}
      />
      <Composition
        id="LogoIcon"
        component={ThunderPortalLogoProFinal}
        durationInFrames={1}
        fps={30}
        width={512}
        height={512}
        defaultProps={{ variant: 'transparent', format: 'icon' }}
      />
      <Composition
        id="LogoIconDark"
        component={ThunderPortalLogoProFinal}
        durationInFrames={1}
        fps={30}
        width={512}
        height={512}
        defaultProps={{ variant: 'dark', format: 'icon' }}
      />
      <Composition
        id="LogoBanner"
        component={ThunderPortalLogoProFinal}
        durationInFrames={1}
        fps={30}
        width={2000}
        height={600}
        defaultProps={{ variant: 'transparent', showText: true, format: 'banner', textPosition: 'right' }}
      />
      <Composition
        id="LogoBannerDark"
        component={ThunderPortalLogoProFinal}
        durationInFrames={1}
        fps={30}
        width={2000}
        height={600}
        defaultProps={{ variant: 'dark', showText: true, format: 'banner', textPosition: 'right' }}
      />
      <Composition
        id="LogoSquareSmall"
        component={ThunderPortalLogoProFinal}
        durationInFrames={1}
        fps={30}
        width={256}
        height={256}
        defaultProps={{ variant: 'transparent', format: 'icon' }}
      />
      <Composition
        id="LogoFavicon"
        component={ThunderPortalLogoProFinal}
        durationInFrames={1}
        fps={30}
        width={32}
        height={32}
        defaultProps={{ variant: 'transparent', format: 'icon' }}
      />
    </>
  );
};