import { useRef, useEffect } from 'react';
import { Emotion, EMOTION_COLORS } from '../../types';

interface WaveformVizProps {
  emotion: Emotion;
  isActive?: boolean;
  width?: number;
  height?: number;
  className?: string;
}

export default function WaveformViz({
  emotion, isActive = false, width = 300, height = 80, className = ''
}: WaveformVizProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const phaseRef = useRef(0);
  const color = EMOTION_COLORS[emotion] || '#7c3aed';

  const AMPLITUDE_MAP: Record<Emotion, number> = {
    anger: 35, disgust: 18, fear: 28, joy: 22,
    neutral: 10, sadness: 14, surprise: 30,
  };
  const FREQ_MAP: Record<Emotion, number> = {
    anger: 3.5, disgust: 1.8, fear: 2.8, joy: 2.2,
    neutral: 1.2, sadness: 1.0, surprise: 3.0,
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const amplitude = isActive ? AMPLITUDE_MAP[emotion] : AMPLITUDE_MAP[emotion] * 0.5;
    const freq = FREQ_MAP[emotion];

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const cx = height / 2;

      // Draw waveform
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.shadowBlur = 12;
      ctx.shadowColor = color;

      for (let x = 0; x < width; x++) {
        const t = (x / width) * Math.PI * 2 * freq;
        const y = cx + Math.sin(t + phaseRef.current) * amplitude
                     + Math.sin(t * 1.7 + phaseRef.current * 0.8) * (amplitude * 0.3)
                     + Math.sin(t * 3.1 + phaseRef.current * 1.2) * (amplitude * 0.15);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Glow copy
      ctx.globalAlpha = 0.3;
      ctx.lineWidth = 6;
      ctx.beginPath();
      for (let x = 0; x < width; x++) {
        const t = (x / width) * Math.PI * 2 * freq;
        const y = cx + Math.sin(t + phaseRef.current) * amplitude
                     + Math.sin(t * 1.7 + phaseRef.current * 0.8) * (amplitude * 0.3);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.globalAlpha = 1.0;

      phaseRef.current += isActive ? 0.06 : 0.02;
      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [emotion, isActive, color, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={`rounded-lg ${className}`}
      style={{ background: 'transparent' }}
    />
  );
}
