"use client";

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import d3Cloud, { Word } from 'd3-cloud';

const wordsData = [
  { text: 'Variational Inference', size: 38 },
  { text: 'Bayesian Learning', size: 36 },
  { text: 'Optimal Transport', size: 34 },
  { text: 'Score Matching', size: 32 },
  { text: 'Fokker-Planck Equation', size: 30 },
  { text: 'Stochastic Process', size: 30 },
  { text: 'Causal Inference', size: 28 },
  { text: 'Manifold Learning', size: 28 },
  { text: 'Function Approximation', size: 26 },
  { text: 'Generalization Bound', size: 26 },
  { text: 'KL Divergence', size: 24 },
  { text: 'Entropy Minimization', size: 24 },
  { text: 'PAC Learning', size: 22 },
  { text: 'Latent Variable Model', size: 22 },
  { text: 'Hilbert Space', size: 20 },
  { text: 'Symbolic Reasoning', size: 20 },
  { text: 'Neural ODE', size: 20 },
  { text: 'Jacobian Matrix', size: 18 },
  { text: 'Gradient Descent', size: 18 },
  { text: 'Expectation Maximization', size: 18 },
  { text: 'Backpropagation', size: 16 },
  { text: 'Stochastic Optimization', size: 16 },
  { text: 'Empirical Risk Minimization', size: 16 },
  { text: 'Regularization', size: 14 },
  { text: 'Information Geometry', size: 14 },
  { text: 'Reproducing Kernel', size: 14 },
  { text: 'Rademacher Complexity', size: 12 },
  { text: 'VC Dimension', size: 12 },
  { text: 'Metric Space', size: 12 },
  { text: 'Theoretical Bounds', size: 12 }
];

interface WordCloudProps {
  width: number;
  height: number;
}

const WordCloudHero: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const draw = () => {
      if (!containerRef.current) return;
      
      const { width, height } = containerRef.current.getBoundingClientRect();
      d3.select(svgRef.current).selectAll("*").remove();
      
      const layout = d3Cloud()
        .size([width, height])
        .words(wordsData.map(d => ({ ...d } as Word)))
        .padding(10)
        .rotate(() => 0)
        .font('Inter, sans-serif')
        .fontSize((d: any) => d.size)
        .on('end', (words: Word[]) => {
          if (!svgRef.current) return;

          const svg = d3.select(svgRef.current)
            .attr('width', layout.size()[0])
            .attr('height', layout.size()[1])
            .append('g')
            .attr('transform', `translate(${layout.size()[0] / 2},${layout.size()[1] / 2})`);

          svg.selectAll('text')
            .data(words)
            .enter().append('text')
            .style('font-size', (d: any) => `${d.size}px`)
            .style('font-family', 'Inter, sans-serif')
            .style('fill', '#002FA7') // Klein Blue
            .attr('text-anchor', 'middle')
            .attr('transform', d => `translate(${d.x},${d.y})rotate(${d.rotate})`)
            .text((d: any) => d.text)
            .style('cursor', 'pointer')
            .on('mouseover', function() {
              d3.select(this).transition().duration(200).style('fill', '#8A0000'); // Peking Red
            })
            .on('mouseout', function() {
              d3.select(this).transition().duration(200).style('fill', '#002FA7'); // Klein Blue
            });
        });

      layout.start();
    };

    draw();

    const resizeObserver = new ResizeObserver(() => draw());
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <section ref={containerRef} className="h-screen w-full relative overflow-hidden flex items-center justify-center bg-white">
      {/* Floating Circles */}
      <div className="floating-circle bg-pku-red/40 w-40 h-40" style={{ top: '10%', left: '10%', animationDelay: '0s' }}></div>
      <div className="floating-circle bg-klein-blue/40 w-32 h-32" style={{ top: '20%', right: '15%', animationDelay: '2s' }}></div>
      <div className="floating-circle bg-pku-red/40 w-24 h-24" style={{ bottom: '15%', left: '20%', animationDelay: '4s' }}></div>
      <div className="floating-circle bg-klein-blue/40 w-52 h-52" style={{ bottom: '25%', right: '10%', animationDelay: '6s' }}></div>

      {/* Word Cloud */}
      <div className="absolute inset-0 z-10">
        <svg ref={svgRef} className="w-full h-full"></svg>
      </div>

      {/* Center Title */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-20 pointer-events-none">
        <h1 id="plote-logo-main" className="text-8xl font-black tracking-tighter">Plote</h1>
        <p className="text-xl text-gray-600 mt-2">Researcher • Scholar • Thinker</p>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce z-20">
         <a href="#profile" className="text-gray-400">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>
         </a>
      </div>
    </section>
  );
};

export default WordCloudHero; 