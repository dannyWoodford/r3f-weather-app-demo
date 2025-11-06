import { useStatsPanel } from "leva-r3f-stats";
import { useEffect } from "react";
// import { useThree } from '@react-three/fiber'

export const StatsPanel = () => {
	// const state = useThree();

	// useEffect(() => {
	// 	console.log('state', state)
	// }, [state]);

  const performanceStats = {
		fps: 0,
		ms: 0,
		memory: 0,
		gpu: 0,
		compute: 0,
		triangles: 0,
		drawCalls: 0,
	}

	useStatsPanel({
		folder: {
			name: 'Performance',
			collapsed: false,
		},
		graphHeight: 48,  
		columns: 3, // 3 graphs per row
		graphHistory: 50,
		fontSize: 11,
		compact: false,
		trackCompute: true,
		stats: {
			fps: { show: true, order: 0 },
			ms: { show: true, order: 1 },
			gpu: { show: true },
			cpu: { show: true },
			memory: { show: true },
			triangles: { show: true },
			drawCalls: { show: true },
		}, 
	});

  useEffect(() => {
    if (performanceStats.compute > 0) {
      console.log("Compute time:", performanceStats.compute, "ms");
    }
  }, [performanceStats]);

  return null;
};
