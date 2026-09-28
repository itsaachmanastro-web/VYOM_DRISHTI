/**
 * VYOM DRISHTI AI — Space-Station & Experiment Research Datasets
 * Pre-configured real scientific datasets for instant No-Code ML Lab training & validation.
 */

export interface SampleDatasetDefinition {
  id: string;
  name: string;
  filename: string;
  category: 'ASTRONAUT_KINEMATICS' | 'PCG_CRYSTALLIZATION' | 'PAYLOAD_SAFETY';
  description: string;
  targetColumn: string;
  csvContent: string;
}

// 1. Astronaut Microgravity Kinematics & Gesture Recognition Dataset
export const SAMPLE_DATASET_KINEMATICS: SampleDatasetDefinition = {
  id: 'ds-kinematics-01',
  name: 'BAS Astronaut Activity & Kinematics (Microgravity Posture)',
  filename: 'BAS_Astronaut_Kinematics_v1.0.csv',
  category: 'ASTRONAUT_KINEMATICS',
  description: 'Joint angles, angular velocities, HOI vectors, and hand-object interaction distances from payload rack operations.',
  targetColumn: 'Activity_Class',
  csvContent: `Timestamp_Sec,Right_Elbow_Angle,Left_Elbow_Angle,Right_Shoulder_Angle,Left_Shoulder_Angle,Angular_Velocity_DegSec,Wrist_Distance_Meters,HOI_Grip_Score,Glovebox_Door_Locked,Rack_Bay_Id,Operator_Posture,Activity_Class
1.2,142.5,138.2,46.1,42.0,1.25,0.48,0.95,1,BAY_4,UPRIGHT,RACK_LATCH_OPERATION
1.8,145.0,140.1,48.3,44.5,1.80,0.52,0.96,1,BAY_4,UPRIGHT,RACK_LATCH_OPERATION
2.4,148.2,142.0,52.0,46.1,2.40,0.55,0.94,1,BAY_4,UPRIGHT,RACK_LATCH_OPERATION
3.0,92.4,110.5,65.2,50.1,4.80,0.22,0.98,1,BAY_4,UPRIGHT,SAMPLE_COLLECTION
3.6,88.1,105.3,68.0,52.4,5.10,0.18,0.99,1,BAY_4,UPRIGHT,SAMPLE_COLLECTION
4.2,85.0,102.0,70.5,55.0,4.60,0.15,0.98,1,BAY_4,UPRIGHT,SAMPLE_COLLECTION
4.8,90.2,108.4,66.1,51.2,3.90,0.20,0.97,1,BAY_4,UPRIGHT,SAMPLE_COLLECTION
5.4,115.4,125.0,55.2,48.0,3.10,0.35,0.88,1,BAY_4,UPRIGHT,PIPETTING_FLUID
6.0,118.0,128.2,56.0,49.1,2.80,0.34,0.92,1,BAY_4,UPRIGHT,PIPETTING_FLUID
6.6,120.5,130.0,58.4,50.0,2.50,0.32,0.94,1,BAY_4,UPRIGHT,PIPETTING_FLUID
7.2,116.2,126.1,54.1,47.5,2.90,0.36,0.90,1,BAY_4,UPRIGHT,PIPETTING_FLUID
7.8,75.0,82.4,85.0,78.2,1.10,0.12,0.96,1,BAY_4,SLIGHT_TILT,MICROSCOPE_ALIGNMENT
8.4,72.5,80.1,87.2,80.0,0.85,0.10,0.97,1,BAY_4,SLIGHT_TILT,MICROSCOPE_ALIGNMENT
9.0,71.0,79.0,88.0,81.5,0.60,0.09,0.98,1,BAY_4,SLIGHT_TILT,MICROSCOPE_ALIGNMENT
9.6,155.0,152.0,25.0,24.0,0.15,0.85,0.05,1,BAY_4,NEUTRAL_REST,RESTING
10.2,156.2,153.5,24.5,23.8,0.12,0.88,0.04,1,BAY_4,NEUTRAL_REST,RESTING
10.8,154.8,151.2,26.0,25.1,0.18,0.82,0.06,1,BAY_4,NEUTRAL_REST,RESTING
11.4,141.0,139.5,45.0,41.2,1.50,0.49,0.93,1,BAY_4,UPRIGHT,RACK_LATCH_OPERATION
12.0,146.5,141.2,49.0,45.0,2.10,0.54,0.95,1,BAY_4,UPRIGHT,RACK_LATCH_OPERATION
12.6,89.5,108.0,67.0,51.0,4.90,0.19,0.98,1,BAY_4,UPRIGHT,SAMPLE_COLLECTION
13.2,86.2,103.5,69.5,53.8,5.20,0.16,0.99,1,BAY_4,UPRIGHT,SAMPLE_COLLECTION
13.8,117.0,127.5,57.0,49.5,2.70,0.33,0.91,1,BAY_4,UPRIGHT,PIPETTING_FLUID
14.4,119.5,129.0,58.0,50.2,2.40,0.31,0.93,1,BAY_4,UPRIGHT,PIPETTING_FLUID
15.0,73.0,81.0,86.5,79.5,0.90,0.11,0.97,1,BAY_4,SLIGHT_TILT,MICROSCOPE_ALIGNMENT
15.6,157.0,154.0,23.0,22.5,0.10,0.90,0.02,1,BAY_4,NEUTRAL_REST,RESTING
16.2,87.4,104.2,68.5,52.0,4.95,0.17,0.98,1,BAY_4,UPRIGHT,SAMPLE_COLLECTION
16.8,118.2,128.0,57.4,49.8,2.65,0.32,0.92,1,BAY_4,UPRIGHT,PIPETTING_FLUID
17.4,74.2,81.8,85.8,78.9,1.00,0.11,0.96,1,BAY_4,SLIGHT_TILT,MICROSCOPE_ALIGNMENT
18.0,143.0,138.8,47.2,43.1,1.75,0.50,0.94,1,BAY_4,UPRIGHT,RACK_LATCH_OPERATION
18.6,155.5,152.8,24.8,24.2,0.14,0.86,0.05,1,BAY_4,NEUTRAL_REST,RESTING`
};

// 2. PCG Protein Crystallization Telemetry Dataset
export const SAMPLE_DATASET_CRYSTALLIZATION: SampleDatasetDefinition = {
  id: 'ds-pcg-02',
  name: 'PCG Protein Crystallization Thermal & Optical Telemetry',
  filename: 'PCG_Protein_Crystallization_Telemetry.csv',
  category: 'PCG_CRYSTALLIZATION',
  description: 'Microfluidic chamber temperatures, flow velocity, optical scattering, and crystal lattice formation quality.',
  targetColumn: 'Crystallization_Quality',
  csvContent: `Incubation_Hour,Chamber_Temp_Celsius,Fluid_Flow_Velocity_uL,Optical_Scattering_NTU,Thermal_Gradient_Delta,Vial_Seal_Integrity,PH_Level,Buffer_Salinity_PPM,Crystallization_Quality
2.0,20.02,0.12,4.5,0.02,1,7.21,152.4,NOMINAL_GROWTH
4.0,20.05,0.11,8.2,0.03,1,7.20,152.0,NOMINAL_GROWTH
6.0,20.01,0.13,14.8,0.02,1,7.22,151.8,NOMINAL_GROWTH
8.0,20.08,0.10,22.1,0.04,1,7.19,152.6,NOMINAL_GROWTH
10.0,20.04,0.12,31.4,0.03,1,7.21,152.1,NOMINAL_GROWTH
12.0,20.02,0.11,42.0,0.02,1,7.20,152.3,NOMINAL_GROWTH
14.0,20.06,0.12,54.6,0.03,1,7.22,151.9,NOMINAL_GROWTH
16.0,20.03,0.10,68.2,0.02,1,7.21,152.2,NOMINAL_GROWTH
18.0,21.80,0.45,110.5,0.42,1,6.85,185.0,PRECIPITATION_DEFECT
20.0,22.10,0.52,145.2,0.58,1,6.72,192.4,PRECIPITATION_DEFECT
22.0,22.40,0.48,178.0,0.64,1,6.65,198.2,PRECIPITATION_DEFECT
24.0,19.20,0.04,38.1,0.22,1,7.45,135.0,SLOW_NUCLEATION
26.0,19.15,0.03,42.5,0.25,1,7.48,132.8,SLOW_NUCLEATION
28.0,20.03,0.12,85.2,0.02,1,7.20,152.0,NOMINAL_GROWTH
30.0,20.05,0.11,99.4,0.03,1,7.21,152.3,NOMINAL_GROWTH
32.0,20.01,0.12,115.0,0.02,1,7.20,151.9,NOMINAL_GROWTH
34.0,21.95,0.48,188.4,0.51,1,6.80,188.2,PRECIPITATION_DEFECT
36.0,19.10,0.02,52.0,0.28,1,7.50,130.5,SLOW_NUCLEATION
38.0,20.04,0.12,132.5,0.03,1,7.21,152.4,NOMINAL_GROWTH
40.0,20.02,0.11,148.0,0.02,1,7.20,152.1,NOMINAL_GROWTH`
};

// 3. Gaganyaan Payload Safety & Glovebox Environmental Sensors Dataset
export const SAMPLE_DATASET_SAFETY: SampleDatasetDefinition = {
  id: 'ds-safety-03',
  name: 'Gaganyaan Payload Safety & Glovebox Environmental Telemetry',
  filename: 'Gaganyaan_Payload_Safety_Sensors.csv',
  category: 'PAYLOAD_SAFETY',
  description: 'Cabin delta pressure, glovebox seal impedance, airflow velocity, VOC concentration, and hazardous breach risk level.',
  targetColumn: 'Hazard_Risk_Level',
  csvContent: `MET_Hour,Pressure_Delta_KPa,Glove_Impedance_KOhm,Airflow_Velocity_MPS,VOC_Gas_PPM,Oxygen_Concentration_Pct,UV_Disinfection_Active,Rack_Vibration_G,Hazard_Risk_Level
1.0,0.02,485.2,0.45,0.12,20.95,1,0.002,LOW_RISK
2.0,0.01,482.0,0.44,0.14,20.94,1,0.001,LOW_RISK
3.0,0.03,488.5,0.46,0.11,20.96,1,0.002,LOW_RISK
4.0,0.02,480.1,0.45,0.13,20.95,1,0.003,LOW_RISK
5.0,0.42,120.5,0.85,1.85,20.40,0,0.045,HIGH_RISK
6.0,0.48,95.0,0.92,2.40,20.10,0,0.062,HIGH_RISK
7.0,0.18,320.0,0.62,0.75,20.75,1,0.018,MODERATE_RISK
8.0,0.15,340.2,0.58,0.68,20.80,1,0.015,MODERATE_RISK
9.0,0.02,484.0,0.45,0.12,20.95,1,0.002,LOW_RISK
10.0,0.01,486.2,0.44,0.11,20.95,1,0.001,LOW_RISK
11.0,0.02,481.8,0.45,0.13,20.94,1,0.002,LOW_RISK
12.0,0.55,80.0,0.98,3.10,19.85,0,0.080,HIGH_RISK
13.0,0.19,315.0,0.64,0.82,20.70,1,0.020,MODERATE_RISK
14.0,0.02,483.5,0.45,0.12,20.95,1,0.002,LOW_RISK
15.0,0.03,487.0,0.46,0.10,20.96,1,0.001,LOW_RISK
16.0,0.46,110.0,0.88,2.15,20.30,0,0.052,HIGH_RISK
17.0,0.16,335.0,0.59,0.70,20.78,1,0.016,MODERATE_RISK
18.0,0.01,485.0,0.44,0.12,20.95,1,0.002,LOW_RISK`
};

export const ALL_SAMPLE_DATASETS: SampleDatasetDefinition[] = [
  SAMPLE_DATASET_KINEMATICS,
  SAMPLE_DATASET_CRYSTALLIZATION,
  SAMPLE_DATASET_SAFETY
];
