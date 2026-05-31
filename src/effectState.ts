import type { EffectPreset } from './presets';
import type {
  EffectStateSetters,
  EffectValues,
  EffectsSnapshot
} from './effectTypes';
import type { RegionalPaletteZone } from './effects/regionalPalette';

export const DEFAULT_REGIONAL_PALETTE_ZONES: RegionalPaletteZone[] = [
  {
    startColor: '#000000',
    endColor: '#00ff99',
    steps: 4,
    invert: false
  },
  {
    startColor: '#050505',
    endColor: '#d6ff00',
    steps: 4,
    invert: false
  },
  {
    startColor: '#000000',
    endColor: '#00c8ff',
    steps: 4,
    invert: false
  },
  {
    startColor: '#140014',
    endColor: '#ff00cc',
    steps: 4,
    invert: false
  }
];

type PanelPresetFields = Pick<
  EffectValues,
  | 'usePanelLayout'
  | 'panelLayoutMode'
  | 'panelLayoutGap'
  | 'panelLayoutBorderWidth'
  | 'panelLayoutBorderColor'
  | 'panelLayoutBackgroundColor'
  | 'panelLayoutPanelOpacity'
  | 'panelLayoutRandomCrop'
  | 'panelLayoutCropIntensity'
  | 'panelLayoutPanX'
  | 'panelLayoutPanY'
  | 'panelLayoutMirrorAlternate'
>;

type RegionalPresetFields = Pick<
  EffectValues,
  | 'useRegionalPalette'
  | 'regionalPaletteMode'
  | 'regionalPaletteZones'
  | 'regionalPaletteRandomizeZones'
  | 'regionalPaletteRandomCellSize'
  | 'regionalPaletteZoneChaos'
  | 'regionalPaletteZoneSeed'
>;

const cloneRegionalZones = (
  zones: RegionalPaletteZone[]
) => {
  return zones.map((zone) => ({
    ...zone
  }));
};

export function createEffectsSnapshot(
  selectedPresetName: string,
  values: EffectValues
): EffectsSnapshot {
  return {
    selectedPresetName,
    ...values,
    regionalPaletteZones: cloneRegionalZones(
      values.regionalPaletteZones
    )
  };
}

export function restoreEffectsSnapshot(
  snapshot: EffectsSnapshot,
  setters: EffectStateSetters
) {
  setters.setSelectedPresetName(snapshot.selectedPresetName);

  setters.setUsePixelation(snapshot.usePixelation);
  setters.setPixelSize(snapshot.pixelSize);

  setters.setUsePsx(snapshot.usePsx);
  setters.setPsxResolutionScale(snapshot.psxResolutionScale);
  setters.setPsxColorLevels(snapshot.psxColorLevels);
  setters.setPsxWarpAmount(snapshot.psxWarpAmount);
  setters.setPsxJitterAmount(snapshot.psxJitterAmount);
  setters.setPsxDitherStrength(snapshot.psxDitherStrength);
  setters.setPsxBlockSize(snapshot.psxBlockSize);
  setters.setPsxCompositeBlur(snapshot.psxCompositeBlur);
  setters.setPsxChromaBleed(snapshot.psxChromaBleed);

  setters.setUsePixelSort(snapshot.usePixelSort);
  setters.setPixelSortDirection(snapshot.pixelSortDirection);
  setters.setPixelSortMode(snapshot.pixelSortMode);
  setters.setPixelSortThreshold(snapshot.pixelSortThreshold);
  setters.setPixelSortAmount(snapshot.pixelSortAmount);

  setters.setUsePalette(snapshot.usePalette);
  setters.setColorStart(snapshot.colorStart);
  setters.setColorEnd(snapshot.colorEnd);
  setters.setSteps(snapshot.steps);
  setters.setSwapPaletteColors(snapshot.swapPaletteColors);

  setters.setUseRegionalPalette(snapshot.useRegionalPalette);
  setters.setRegionalPaletteMode(snapshot.regionalPaletteMode);
  setters.setRegionalPaletteZones(
    cloneRegionalZones(snapshot.regionalPaletteZones)
  );
  setters.setRegionalPaletteRandomizeZones(
    snapshot.regionalPaletteRandomizeZones
  );
  setters.setRegionalPaletteRandomCellSize(
    snapshot.regionalPaletteRandomCellSize
  );
  setters.setRegionalPaletteZoneChaos(
    snapshot.regionalPaletteZoneChaos
  );
  setters.setRegionalPaletteZoneSeed(
    snapshot.regionalPaletteZoneSeed
  );

  setters.setUseDither(snapshot.useDither);
  setters.setDitherMode(snapshot.ditherMode);
  setters.setThreshold(snapshot.threshold);

  setters.setUseArtifactMask(snapshot.useArtifactMask);
  setters.setArtifactMaskMode(snapshot.artifactMaskMode);
  setters.setArtifactMaskThreshold(
    snapshot.artifactMaskThreshold
  );

  setters.setUseGlitch(snapshot.useGlitch);
  setters.setGlitch(snapshot.glitch);
  setters.setGlitchChaos(snapshot.glitchChaos);
  setters.setGlitchWidth(snapshot.glitchWidth);
  setters.setGlitchOverrideDither(snapshot.glitchOverrideDither);
  setters.setEdgeGlitchOnly(snapshot.edgeGlitchOnly);

  setters.setUseCodecDamage(snapshot.useCodecDamage);
  setters.setCodecDamageBlockSize(snapshot.codecDamageBlockSize);
  setters.setCodecDamageAmount(snapshot.codecDamageAmount);
  setters.setCodecDamageChromaShift(
    snapshot.codecDamageChromaShift
  );
  setters.setCodecDamageColorDepth(
    snapshot.codecDamageColorDepth
  );

  setters.setUseChannelPacketLoss(snapshot.useChannelPacketLoss);
  setters.setChannelPacketLossChannel(
    snapshot.channelPacketLossChannel
  );
  setters.setChannelPacketLossBlockSize(
    snapshot.channelPacketLossBlockSize
  );
  setters.setChannelPacketLossAmount(
    snapshot.channelPacketLossAmount
  );
  setters.setChannelPacketLossShift(
    snapshot.channelPacketLossShift
  );

  setters.setUseFrameEcho(snapshot.useFrameEcho);
  setters.setFrameEchoMode(snapshot.frameEchoMode);
  setters.setFrameEchoCopies(snapshot.frameEchoCopies);
  setters.setFrameEchoOffset(snapshot.frameEchoOffset);
  setters.setFrameEchoDecay(snapshot.frameEchoDecay);
  setters.setFrameEchoJitter(snapshot.frameEchoJitter);

  setters.setUseLumaDisplacement(snapshot.useLumaDisplacement);
  setters.setLumaDisplacementMode(
    snapshot.lumaDisplacementMode
  );
  setters.setLumaDisplacementAmount(
    snapshot.lumaDisplacementAmount
  );
  setters.setLumaDisplacementThreshold(
    snapshot.lumaDisplacementThreshold
  );
  setters.setLumaDisplacementJitter(
    snapshot.lumaDisplacementJitter
  );

  setters.setUseScanDrift(snapshot.useScanDrift);
  setters.setScanDriftDirection(snapshot.scanDriftDirection);
  setters.setScanDriftAmount(snapshot.scanDriftAmount);
  setters.setScanDriftBandSize(snapshot.scanDriftBandSize);
  setters.setScanDriftChaos(snapshot.scanDriftChaos);

  setters.setUseMotionSmear(snapshot.useMotionSmear);
  setters.setMotionSmearDirection(snapshot.motionSmearDirection);
  setters.setMotionSmearLength(snapshot.motionSmearLength);
  setters.setMotionSmearDecay(snapshot.motionSmearDecay);
  setters.setMotionSmearThreshold(snapshot.motionSmearThreshold);

  setters.setUseChromatic(snapshot.useChromatic);
  setters.setChromaticOffset(snapshot.chromaticOffset);

  setters.setUseAscii(snapshot.useAscii);
  setters.setAsciiCellSize(snapshot.asciiCellSize);
  setters.setAsciiOpacity(snapshot.asciiOpacity);
  setters.setAsciiMode(snapshot.asciiMode);
  setters.setAsciiColor(snapshot.asciiColor);

  setters.setUsePatternDither(snapshot.usePatternDither);
  setters.setPatternDitherShape(snapshot.patternDitherShape);
  setters.setPatternDitherScale(snapshot.patternDitherScale);
  setters.setPatternDitherDensity(snapshot.patternDitherDensity);
  setters.setPatternDitherOpacity(snapshot.patternDitherOpacity);
  setters.setPatternDitherColor(snapshot.patternDitherColor);
  setters.setPatternDitherBackgroundColor(
    snapshot.patternDitherBackgroundColor
  );
  setters.setPatternDitherInvert(snapshot.patternDitherInvert);
  setters.setPatternDitherReplaceImage(
    snapshot.patternDitherReplaceImage
  );

  setters.setUseDataOverlay(snapshot.useDataOverlay);
  setters.setDataOverlayMode(snapshot.dataOverlayMode);
  setters.setDataOverlayDensity(snapshot.dataOverlayDensity);
  setters.setDataOverlayFontSize(snapshot.dataOverlayFontSize);
  setters.setDataOverlayOpacity(snapshot.dataOverlayOpacity);
  setters.setDataOverlayColor(snapshot.dataOverlayColor);
  setters.setDataOverlayCustomText(snapshot.dataOverlayCustomText);

  setters.setUsePosterText(snapshot.usePosterText);
  setters.setPosterTextContent(snapshot.posterTextContent);
  setters.setPosterTextX(snapshot.posterTextX);
  setters.setPosterTextY(snapshot.posterTextY);
  setters.setPosterTextVertical(snapshot.posterTextVertical);
  setters.setPosterTextFont(snapshot.posterTextFont);
  setters.setPosterTextWeight(snapshot.posterTextWeight);
  setters.setPosterTextSize(snapshot.posterTextSize);
  setters.setPosterTextTracking(snapshot.posterTextTracking);
  setters.setPosterTextOpacity(snapshot.posterTextOpacity);
  setters.setPosterTextColor(snapshot.posterTextColor);
  setters.setPosterTextGlitch(snapshot.posterTextGlitch);
  setters.setPosterTextMode(snapshot.posterTextMode);
  setters.setPosterTextPanelAnchor(
    snapshot.posterTextPanelAnchor
  );

  setters.setUseHudFrame(snapshot.useHudFrame);
  setters.setHudFrameStyle(snapshot.hudFrameStyle);
  setters.setHudFrameOpacity(snapshot.hudFrameOpacity);
  setters.setHudFrameColor(snapshot.hudFrameColor);
  setters.setHudFrameShowGrid(snapshot.hudFrameShowGrid);
  setters.setHudFrameShowLabels(snapshot.hudFrameShowLabels);
  setters.setHudFrameShowCornerMarks(
    snapshot.hudFrameShowCornerMarks
  );
  setters.setHudFrameSafeArea(snapshot.hudFrameSafeArea);

  setters.setUseSignalWaves(snapshot.useSignalWaves);
  setters.setSignalWavesMode(snapshot.signalWavesMode);
  setters.setSignalWavesFrequency(snapshot.signalWavesFrequency);
  setters.setSignalWavesAmplitude(snapshot.signalWavesAmplitude);
  setters.setSignalWavesDensity(snapshot.signalWavesDensity);
  setters.setSignalWavesOpacity(snapshot.signalWavesOpacity);
  setters.setSignalWavesColor(snapshot.signalWavesColor);
  setters.setSignalWavesBackgroundColor(
    snapshot.signalWavesBackgroundColor
  );
  setters.setSignalWavesReplaceImage(
    snapshot.signalWavesReplaceImage
  );
  setters.setSignalWavesReactToImage(
    snapshot.signalWavesReactToImage
  );

  setters.setUsePanelLayout(snapshot.usePanelLayout);
  setters.setPanelLayoutMode(snapshot.panelLayoutMode);
  setters.setPanelLayoutGap(snapshot.panelLayoutGap);
  setters.setPanelLayoutBorderWidth(
    snapshot.panelLayoutBorderWidth
  );
  setters.setPanelLayoutBorderColor(
    snapshot.panelLayoutBorderColor
  );
  setters.setPanelLayoutBackgroundColor(
    snapshot.panelLayoutBackgroundColor
  );
  setters.setPanelLayoutPanelOpacity(
    snapshot.panelLayoutPanelOpacity
  );
  setters.setPanelLayoutRandomCrop(
    snapshot.panelLayoutRandomCrop
  );
  setters.setPanelLayoutCropIntensity(
    snapshot.panelLayoutCropIntensity
  );
  setters.setPanelLayoutPanX(snapshot.panelLayoutPanX);
  setters.setPanelLayoutPanY(snapshot.panelLayoutPanY);
  setters.setPanelLayoutMirrorAlternate(
    snapshot.panelLayoutMirrorAlternate
  );

  setters.setUseNoise(snapshot.useNoise);
  setters.setNoiseAmount(snapshot.noiseAmount);

  setters.setUseScanlines(snapshot.useScanlines);
  setters.setScanlineIntensity(snapshot.scanlineIntensity);
}

export function clearEffectSettings(setters: EffectStateSetters) {
  setters.setSelectedPresetName('CUSTOM');

  setters.setUsePixelation(false);
  setters.setPixelSize(4);

  setters.setUsePsx(false);
  setters.setPsxResolutionScale(4);
  setters.setPsxColorLevels(8);
  setters.setPsxWarpAmount(2);
  setters.setPsxJitterAmount(2);
  setters.setPsxDitherStrength(0.45);
  setters.setPsxBlockSize(12);
  setters.setPsxCompositeBlur(0.8);
  setters.setPsxChromaBleed(1);

  setters.setUsePixelSort(false);
  setters.setPixelSortDirection('horizontal');
  setters.setPixelSortMode('bright');
  setters.setPixelSortThreshold(160);
  setters.setPixelSortAmount(0.75);

  setters.setUsePalette(false);
  setters.setColorStart('#000000');
  setters.setColorEnd('#00ff00');
  setters.setSteps(4);
  setters.setSwapPaletteColors(false);

  setters.setUseRegionalPalette(false);
  setters.setRegionalPaletteMode('random-zones');
  setters.setRegionalPaletteZones(
    cloneRegionalZones(DEFAULT_REGIONAL_PALETTE_ZONES)
  );
  setters.setRegionalPaletteRandomizeZones(false);
  setters.setRegionalPaletteRandomCellSize(180);
  setters.setRegionalPaletteZoneChaos(55);
  setters.setRegionalPaletteZoneSeed(12345);

  setters.setUseDither(false);
  setters.setDitherMode('floyd-steinberg');
  setters.setThreshold(255);

  setters.setUseArtifactMask(false);
  setters.setArtifactMaskMode('all');
  setters.setArtifactMaskThreshold(128);

  setters.setUseGlitch(false);
  setters.setGlitch(0);
  setters.setGlitchChaos(0);
  setters.setGlitchWidth(100);
  setters.setGlitchOverrideDither(false);
  setters.setEdgeGlitchOnly(true);

  setters.setUseCodecDamage(false);
  setters.setCodecDamageBlockSize(18);
  setters.setCodecDamageAmount(0.35);
  setters.setCodecDamageChromaShift(3);
  setters.setCodecDamageColorDepth(8);

  setters.setUseChannelPacketLoss(false);
  setters.setChannelPacketLossChannel('rgb');
  setters.setChannelPacketLossBlockSize(20);
  setters.setChannelPacketLossAmount(0.35);
  setters.setChannelPacketLossShift(12);

  setters.setUseFrameEcho(false);
  setters.setFrameEchoMode('horizontal');
  setters.setFrameEchoCopies(3);
  setters.setFrameEchoOffset(18);
  setters.setFrameEchoDecay(0.55);
  setters.setFrameEchoJitter(4);

  setters.setUseLumaDisplacement(false);
  setters.setLumaDisplacementMode('split');
  setters.setLumaDisplacementAmount(18);
  setters.setLumaDisplacementThreshold(128);
  setters.setLumaDisplacementJitter(3);

  setters.setUseScanDrift(false);
  setters.setScanDriftDirection('horizontal');
  setters.setScanDriftAmount(18);
  setters.setScanDriftBandSize(18);
  setters.setScanDriftChaos(0.35);

  setters.setUseMotionSmear(false);
  setters.setMotionSmearDirection('horizontal');
  setters.setMotionSmearLength(28);
  setters.setMotionSmearDecay(0.55);
  setters.setMotionSmearThreshold(128);

  setters.setUseChromatic(false);
  setters.setChromaticOffset(3);

  setters.setUseAscii(false);
  setters.setAsciiCellSize(12);
  setters.setAsciiOpacity(0.5);
  setters.setAsciiMode('overlay');
  setters.setAsciiColor('#00ff99');

  setters.setUsePatternDither(false);
  setters.setPatternDitherShape('dot');
  setters.setPatternDitherScale(12);
  setters.setPatternDitherDensity(100);
  setters.setPatternDitherOpacity(0.9);
  setters.setPatternDitherColor('#00ff99');
  setters.setPatternDitherBackgroundColor('#050505');
  setters.setPatternDitherInvert(false);
  setters.setPatternDitherReplaceImage(false);

  setters.setUseDataOverlay(false);
  setters.setDataOverlayMode('random-codes');
  setters.setDataOverlayDensity(18);
  setters.setDataOverlayFontSize(11);
  setters.setDataOverlayOpacity(0.45);
  setters.setDataOverlayColor('#00ff99');
  setters.setDataOverlayCustomText('SIGNAL UNSTABLE');

  setters.setUsePosterText(false);
  setters.setPosterTextContent('SIGNAL DECAY');
  setters.setPosterTextX(50);
  setters.setPosterTextY(50);
  setters.setPosterTextVertical(false);
  setters.setPosterTextFont('consolas');
  setters.setPosterTextWeight(700);
  setters.setPosterTextSize(88);
  setters.setPosterTextTracking(4);
  setters.setPosterTextOpacity(0.75);
  setters.setPosterTextColor('#00ff99');
  setters.setPosterTextGlitch(false);
  setters.setPosterTextMode('blend');
  setters.setPosterTextPanelAnchor('free');

  setters.setUseHudFrame(false);
  setters.setHudFrameStyle('scan-frame');
  setters.setHudFrameOpacity(0.75);
  setters.setHudFrameColor('#00ff99');
  setters.setHudFrameShowGrid(true);
  setters.setHudFrameShowLabels(true);
  setters.setHudFrameShowCornerMarks(true);
  setters.setHudFrameSafeArea(3);

  setters.setUseSignalWaves(false);
  setters.setSignalWavesMode('horizontal');
  setters.setSignalWavesFrequency(12);
  setters.setSignalWavesAmplitude(26);
  setters.setSignalWavesDensity(18);
  setters.setSignalWavesOpacity(0.65);
  setters.setSignalWavesColor('#00ff99');
  setters.setSignalWavesBackgroundColor('#050505');
  setters.setSignalWavesReplaceImage(false);
  setters.setSignalWavesReactToImage(true);

  setters.setUsePanelLayout(false);
  setters.setPanelLayoutMode('side-panel');
  setters.setPanelLayoutGap(10);
  setters.setPanelLayoutBorderWidth(1);
  setters.setPanelLayoutBorderColor('#00ff99');
  setters.setPanelLayoutBackgroundColor('#050505');
  setters.setPanelLayoutPanelOpacity(1);
  setters.setPanelLayoutRandomCrop(true);
  setters.setPanelLayoutCropIntensity(55);
  setters.setPanelLayoutPanX(0);
  setters.setPanelLayoutPanY(0);
  setters.setPanelLayoutMirrorAlternate(false);

  setters.setUseNoise(false);
  setters.setNoiseAmount(15);

  setters.setUseScanlines(false);
  setters.setScanlineIntensity(0.2);
}

export function applyEffectPreset(
  preset: EffectPreset,
  setters: EffectStateSetters
) {
  const panelPreset =
    preset as EffectPreset & Partial<PanelPresetFields>;

  const regionalPreset =
    preset as EffectPreset & Partial<RegionalPresetFields>;

  setters.setSelectedPresetName(preset.name);

  setters.setUsePixelation(preset.usePixelation);
  setters.setPixelSize(preset.pixelSize);

  setters.setUsePsx(preset.usePsx);
  setters.setPsxResolutionScale(preset.psxResolutionScale);
  setters.setPsxColorLevels(preset.psxColorLevels);
  setters.setPsxWarpAmount(preset.psxWarpAmount);
  setters.setPsxJitterAmount(preset.psxJitterAmount);
  setters.setPsxDitherStrength(preset.psxDitherStrength);
  setters.setPsxBlockSize(preset.psxBlockSize);
  setters.setPsxCompositeBlur(preset.psxCompositeBlur);
  setters.setPsxChromaBleed(preset.psxChromaBleed);

  setters.setUsePixelSort(preset.usePixelSort);
  setters.setPixelSortDirection(preset.pixelSortDirection);
  setters.setPixelSortMode(preset.pixelSortMode);
  setters.setPixelSortThreshold(preset.pixelSortThreshold);
  setters.setPixelSortAmount(preset.pixelSortAmount);

  setters.setUsePalette(preset.usePalette);
  setters.setColorStart(preset.colorStart);
  setters.setColorEnd(preset.colorEnd);
  setters.setSteps(preset.steps);
  setters.setSwapPaletteColors(preset.swapPaletteColors);

  setters.setUseRegionalPalette(
    regionalPreset.useRegionalPalette ?? false
  );
  setters.setRegionalPaletteMode(
    regionalPreset.regionalPaletteMode ?? 'random-zones'
  );
  setters.setRegionalPaletteZones(
    regionalPreset.regionalPaletteZones
      ? cloneRegionalZones(
          regionalPreset.regionalPaletteZones
        )
      : cloneRegionalZones(DEFAULT_REGIONAL_PALETTE_ZONES)
  );
  setters.setRegionalPaletteRandomizeZones(
    regionalPreset.regionalPaletteRandomizeZones ?? false
  );
  setters.setRegionalPaletteRandomCellSize(
    regionalPreset.regionalPaletteRandomCellSize ?? 180
  );
  setters.setRegionalPaletteZoneChaos(
    regionalPreset.regionalPaletteZoneChaos ?? 55
  );
  setters.setRegionalPaletteZoneSeed(
    regionalPreset.regionalPaletteZoneSeed ?? 12345
  );

  setters.setUseDither(preset.useDither);
  setters.setDitherMode(preset.ditherMode);
  setters.setThreshold(preset.threshold);

  setters.setUseArtifactMask(preset.useArtifactMask);
  setters.setArtifactMaskMode(preset.artifactMaskMode);
  setters.setArtifactMaskThreshold(
    preset.artifactMaskThreshold
  );

  setters.setUseGlitch(preset.useGlitch);
  setters.setGlitch(preset.glitch);
  setters.setGlitchChaos(preset.glitchChaos);
  setters.setGlitchWidth(preset.glitchWidth);
  setters.setGlitchOverrideDither(preset.glitchOverrideDither);
  setters.setEdgeGlitchOnly(preset.edgeGlitchOnly);

  setters.setUseCodecDamage(preset.useCodecDamage);
  setters.setCodecDamageBlockSize(preset.codecDamageBlockSize);
  setters.setCodecDamageAmount(preset.codecDamageAmount);
  setters.setCodecDamageChromaShift(
    preset.codecDamageChromaShift
  );
  setters.setCodecDamageColorDepth(
    preset.codecDamageColorDepth
  );

  setters.setUseChannelPacketLoss(preset.useChannelPacketLoss);
  setters.setChannelPacketLossChannel(
    preset.channelPacketLossChannel
  );
  setters.setChannelPacketLossBlockSize(
    preset.channelPacketLossBlockSize
  );
  setters.setChannelPacketLossAmount(
    preset.channelPacketLossAmount
  );
  setters.setChannelPacketLossShift(
    preset.channelPacketLossShift
  );

  setters.setUseFrameEcho(preset.useFrameEcho);
  setters.setFrameEchoMode(preset.frameEchoMode);
  setters.setFrameEchoCopies(preset.frameEchoCopies);
  setters.setFrameEchoOffset(preset.frameEchoOffset);
  setters.setFrameEchoDecay(preset.frameEchoDecay);
  setters.setFrameEchoJitter(preset.frameEchoJitter);

  setters.setUseLumaDisplacement(preset.useLumaDisplacement);
  setters.setLumaDisplacementMode(
    preset.lumaDisplacementMode
  );
  setters.setLumaDisplacementAmount(
    preset.lumaDisplacementAmount
  );
  setters.setLumaDisplacementThreshold(
    preset.lumaDisplacementThreshold
  );
  setters.setLumaDisplacementJitter(
    preset.lumaDisplacementJitter
  );

  setters.setUseScanDrift(preset.useScanDrift);
  setters.setScanDriftDirection(preset.scanDriftDirection);
  setters.setScanDriftAmount(preset.scanDriftAmount);
  setters.setScanDriftBandSize(preset.scanDriftBandSize);
  setters.setScanDriftChaos(preset.scanDriftChaos);

  setters.setUseMotionSmear(preset.useMotionSmear);
  setters.setMotionSmearDirection(preset.motionSmearDirection);
  setters.setMotionSmearLength(preset.motionSmearLength);
  setters.setMotionSmearDecay(preset.motionSmearDecay);
  setters.setMotionSmearThreshold(preset.motionSmearThreshold);

  setters.setUseChromatic(preset.useChromatic);
  setters.setChromaticOffset(preset.chromaticOffset);

  setters.setUseAscii(preset.useAscii);
  setters.setAsciiCellSize(preset.asciiCellSize);
  setters.setAsciiOpacity(preset.asciiOpacity);
  setters.setAsciiMode(preset.asciiMode);
  setters.setAsciiColor(preset.asciiColor);

  setters.setUsePatternDither(preset.usePatternDither);
  setters.setPatternDitherShape(preset.patternDitherShape);
  setters.setPatternDitherScale(preset.patternDitherScale);
  setters.setPatternDitherDensity(preset.patternDitherDensity);
  setters.setPatternDitherOpacity(preset.patternDitherOpacity);
  setters.setPatternDitherColor(preset.patternDitherColor);
  setters.setPatternDitherBackgroundColor(
    preset.patternDitherBackgroundColor
  );
  setters.setPatternDitherInvert(preset.patternDitherInvert);
  setters.setPatternDitherReplaceImage(
    preset.patternDitherReplaceImage
  );

  setters.setUseSignalWaves(preset.useSignalWaves);
  setters.setSignalWavesMode(preset.signalWavesMode);
  setters.setSignalWavesFrequency(preset.signalWavesFrequency);
  setters.setSignalWavesAmplitude(preset.signalWavesAmplitude);
  setters.setSignalWavesDensity(preset.signalWavesDensity);
  setters.setSignalWavesOpacity(preset.signalWavesOpacity);
  setters.setSignalWavesColor(preset.signalWavesColor);
  setters.setSignalWavesBackgroundColor(
    preset.signalWavesBackgroundColor
  );
  setters.setSignalWavesReplaceImage(
    preset.signalWavesReplaceImage
  );
  setters.setSignalWavesReactToImage(
    preset.signalWavesReactToImage
  );

  setters.setUseDataOverlay(preset.useDataOverlay);
  setters.setDataOverlayMode(preset.dataOverlayMode);
  setters.setDataOverlayDensity(preset.dataOverlayDensity);
  setters.setDataOverlayFontSize(preset.dataOverlayFontSize);
  setters.setDataOverlayOpacity(preset.dataOverlayOpacity);
  setters.setDataOverlayColor(preset.dataOverlayColor);
  setters.setDataOverlayCustomText(preset.dataOverlayCustomText);

  setters.setUsePosterText(preset.usePosterText);
  setters.setPosterTextContent(preset.posterTextContent);
  setters.setPosterTextX(preset.posterTextX);
  setters.setPosterTextY(preset.posterTextY);
  setters.setPosterTextVertical(preset.posterTextVertical);
  setters.setPosterTextFont(preset.posterTextFont);
  setters.setPosterTextWeight(preset.posterTextWeight);
  setters.setPosterTextSize(preset.posterTextSize);
  setters.setPosterTextTracking(preset.posterTextTracking);
  setters.setPosterTextOpacity(preset.posterTextOpacity);
  setters.setPosterTextColor(preset.posterTextColor);
  setters.setPosterTextGlitch(preset.posterTextGlitch);
  setters.setPosterTextMode(preset.posterTextMode);
  setters.setPosterTextPanelAnchor(preset.posterTextPanelAnchor);

  setters.setUseHudFrame(preset.useHudFrame);
  setters.setHudFrameStyle(preset.hudFrameStyle);
  setters.setHudFrameOpacity(preset.hudFrameOpacity);
  setters.setHudFrameColor(preset.hudFrameColor);
  setters.setHudFrameShowGrid(preset.hudFrameShowGrid);
  setters.setHudFrameShowLabels(preset.hudFrameShowLabels);
  setters.setHudFrameShowCornerMarks(
    preset.hudFrameShowCornerMarks
  );
  setters.setHudFrameSafeArea(preset.hudFrameSafeArea);

  setters.setUsePanelLayout(panelPreset.usePanelLayout ?? false);
  setters.setPanelLayoutMode(
    panelPreset.panelLayoutMode ?? 'side-panel'
  );
  setters.setPanelLayoutGap(panelPreset.panelLayoutGap ?? 10);
  setters.setPanelLayoutBorderWidth(
    panelPreset.panelLayoutBorderWidth ?? 1
  );
  setters.setPanelLayoutBorderColor(
    panelPreset.panelLayoutBorderColor ?? '#00ff99'
  );
  setters.setPanelLayoutBackgroundColor(
    panelPreset.panelLayoutBackgroundColor ?? '#050505'
  );
  setters.setPanelLayoutPanelOpacity(
    panelPreset.panelLayoutPanelOpacity ?? 1
  );
  setters.setPanelLayoutRandomCrop(
    panelPreset.panelLayoutRandomCrop ?? true
  );
  setters.setPanelLayoutCropIntensity(
    panelPreset.panelLayoutCropIntensity ?? 55
  );
  setters.setPanelLayoutPanX(panelPreset.panelLayoutPanX ?? 0);
  setters.setPanelLayoutPanY(panelPreset.panelLayoutPanY ?? 0);
  setters.setPanelLayoutMirrorAlternate(
    panelPreset.panelLayoutMirrorAlternate ?? false
  );

  setters.setUseNoise(preset.useNoise);
  setters.setNoiseAmount(preset.noiseAmount);

  setters.setUseScanlines(preset.useScanlines);
  setters.setScanlineIntensity(preset.scanlineIntensity);
}
