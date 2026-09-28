import React from 'react';
import { PipelineVisualizer } from './PipelineVisualizer';
import { ModelMetricsCard } from './ModelMetricsCard';
import { HOIInteractionMatrix } from './HOIInteractionMatrix';
import { CameraFeedCanvas } from '../liveMonitor/CameraFeedCanvas';

export const AIPerceptionCenter: React.FC = () => {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* 1. End-to-end Pipeline Flow */}
      <PipelineVisualizer />

      {/* 2. Visual Feed & HOI Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 space-y-6">
          <CameraFeedCanvas />
        </div>

        <div className="lg:col-span-5 space-y-6">
          <HOIInteractionMatrix />
        </div>
      </div>

      {/* 3. Deep-Dive Quantized Model Telemetry */}
      <ModelMetricsCard />
    </div>
  );
};
