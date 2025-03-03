"use client";
import { cn } from "@/utils/cn";
import React, { useEffect, useRef, useCallback, useMemo } from "react";
import { createNoise3D } from "simplex-noise";

export const WavyBackground = ({
  children,
  className,
  containerClassName,
  colors,
  waveWidth,
  backgroundFill,
  blur = 10,
  speed = "fast",
  waveOpacity = 0.5,
  ...props
}: {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  colors?: string[];
  waveWidth?: number;
  backgroundFill?: string;
  blur?: number;
  speed?: "slow" | "fast";
  waveOpacity?: number;
}) => {
  const noise = createNoise3D();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationId = useRef<number | null>(null); // Store animation ID persistently

  // Memoize wave colors
  const waveColors = useMemo(
    () =>
      colors ?? ["#38bdf8", "#818cf8", "#c084fc", "#e879f9", "#22d3ee"],
    [colors]
  );

  // Memoize getSpeed function
  const getSpeed = useCallback(() => {
    return speed === "fast" ? 0.002 : 0.001;
  }, [speed]);

  const init = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.filter = `blur(${blur}px)`;

    let nt = 0;

    const drawWave = (n: number) => {
      nt += getSpeed();
      for (let i = 0; i < n; i++) {
        ctx.beginPath();
        ctx.lineWidth = waveWidth || 50;
        ctx.strokeStyle = waveColors[i % waveColors.length];

        for (let x = 0; x < canvas.width; x += 5) {
          const y = noise(x / 800, 0.3 * i, nt) * 100;
          ctx.lineTo(x, y + canvas.height * 0.5);
        }

        ctx.stroke();
        ctx.closePath();
      }
    };

    const render = () => {
      ctx.fillStyle = backgroundFill || "black";
      ctx.globalAlpha = waveOpacity || 0.5;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawWave(5);
      animationId.current = requestAnimationFrame(render);
    };

    render();

    window.onresize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.filter = `blur(${blur}px)`;
    };
  }, [backgroundFill, blur, waveWidth, waveColors, waveOpacity, getSpeed, noise]);

  useEffect(() => {
    init();
    return () => {
      if (animationId.current) {
        cancelAnimationFrame(animationId.current);
      }
    };
  }, [init]); // No warning since `animationId` is a ref

  return (
    <div className={cn("h-screen flex flex-col items-center justify-center", containerClassName)}>
      <canvas className="absolute inset-0 z-0" ref={canvasRef} id="canvas"></canvas>
      <div className={cn("relative z-10", className)} {...props}>
        {children}
      </div>
    </div>
  );
};
