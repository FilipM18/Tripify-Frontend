import { useState, useEffect, useRef } from 'react';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import { Subscription } from 'expo-sensors/build/Pedometer';

interface AccelerometerData {
  x: number;
  y: number;
  z: number;
}

interface GyroscopeData {
  x: number;
  y: number;
  z: number;
}

export function useMotionElevation() {
  const [elevationGain, setElevationGain] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const accelerometerRef = useRef<Subscription | null>(null);
  const gyroscopeRef = useRef<Subscription | null>(null);
  
  const stepDetectorRef = useRef({
    accelBuffer: [] as number[],
    lastStepTime: 0,
    stepCount: 0,
    totalUpwardSteps: 0,
  });

  const calibrationRef = useRef({
    samples: [] as number[],
    isCalibrated: false,
    baseline: 0,
  });
  
  const gyroDataRef = useRef({
    pitch: 0,
    roll: 0,
    yaw: 0,
  });
  
  const detectUpwardMovement = (accelData: AccelerometerData) => {
    const { x, y, z } = accelData;

    const totalAccel = Math.sqrt(x * x + y * y + z * z);
    
    if (!calibrationRef.current.isCalibrated) {
      calibrationRef.current.samples.push(totalAccel);
      
      if (calibrationRef.current.samples.length >= 50) {
        const sum = calibrationRef.current.samples.reduce((a, b) => a + b, 0);
        calibrationRef.current.baseline = sum / calibrationRef.current.samples.length;
        calibrationRef.current.isCalibrated = true;
        console.log('Calibration complete. Baseline:', calibrationRef.current.baseline);
      }
      return;
    }
    
    const detector = stepDetectorRef.current;
    detector.accelBuffer.push(totalAccel);
    
    if (detector.accelBuffer.length > 20) {
      detector.accelBuffer.shift();
    }
 
    if (detector.accelBuffer.length < 20) return;
    
    const currentTime = Date.now();
    const timeSinceLastStep = currentTime - detector.lastStepTime;
    
    if (timeSinceLastStep < 300) return;
    
    const max = Math.max(...detector.accelBuffer);
    const min = Math.min(...detector.accelBuffer);
    const range = max - min;
    
    if (range > 0.8 && range < 4.0) {
      const pitch = gyroDataRef.current.pitch;
      
      const isUpward = pitch < -5 || (range > 1.5 && max > calibrationRef.current.baseline + 0.5);
      
      if (isUpward) {
        detector.totalUpwardSteps++;
        
        if (detector.totalUpwardSteps % 15 === 0) {
          setElevationGain(prev => {
            const newGain = prev + 2.5;
            console.log(`Elevation gain: ${newGain.toFixed(1)}m (${detector.totalUpwardSteps} upward steps)`);
            return newGain;
          });
        }
      }
      
      detector.lastStepTime = currentTime;
      detector.stepCount++;
    }
  };
  
  const startTracking = async () => {
    console.log('Starting motion-based elevation tracking...');
    setIsTracking(true);
    setElevationGain(0);
    
    stepDetectorRef.current = {
      accelBuffer: [],
      lastStepTime: 0,
      stepCount: 0,
      totalUpwardSteps: 0,
    };
    
    calibrationRef.current = {
      samples: [],
      isCalibrated: false,
      baseline: 0,
    };
    
    gyroDataRef.current = {
      pitch: 0,
      roll: 0,
      yaw: 0,
    };
    
    await Accelerometer.setUpdateInterval(50);
    await Gyroscope.setUpdateInterval(50);
    
    accelerometerRef.current = Accelerometer.addListener((data: AccelerometerData) => {
      detectUpwardMovement(data);
    });
    
    gyroscopeRef.current = Gyroscope.addListener((data: GyroscopeData) => {
      const pitch = Math.atan2(-data.x, Math.sqrt(data.y * data.y + data.z * data.z)) * (180 / Math.PI);
      gyroDataRef.current.pitch = pitch;
      gyroDataRef.current.roll = Math.atan2(data.y, data.z) * (180 / Math.PI);
      gyroDataRef.current.yaw = data.z; 
    });
  };
  
  const stopTracking = () => {
    console.log('Stopping motion-based elevation tracking');
    console.log(`Final stats: ${stepDetectorRef.current.stepCount} total steps, ${stepDetectorRef.current.totalUpwardSteps} upward steps`);
    
    setIsTracking(false);

    if (accelerometerRef.current) {
      accelerometerRef.current.remove();
      accelerometerRef.current = null;
    }
    

    if (gyroscopeRef.current) {
      gyroscopeRef.current.remove();
      gyroscopeRef.current = null;
    }
  };
  
  const resetElevation = () => {
    setElevationGain(0);
    stepDetectorRef.current.totalUpwardSteps = 0;
    stepDetectorRef.current.stepCount = 0;
  };
  
  useEffect(() => {
    return () => {
      if (accelerometerRef.current) {
        accelerometerRef.current.remove();
      }
      if (gyroscopeRef.current) {
        gyroscopeRef.current.remove();
      }
    };
  }, []);
  
  return {
    elevationGain,
    isTracking,
    startTracking,
    stopTracking,
    resetElevation,
    stepCount: stepDetectorRef.current.stepCount,
    upwardSteps: stepDetectorRef.current.totalUpwardSteps,
  };
}