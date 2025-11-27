import React, { useState, useEffect } from 'react'; // [修改1] 删除了 useMemo
import Head from 'next/head';
import dynamic from 'next/dynamic';
import * as echarts from 'echarts';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import { Trophy, Globe, Award, MapPin } from 'lucide-react';
import { getTravelData } from '@/lib/travel';
import { getHonorsData } from '@/lib/honors';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

type TravelData = {
  details: {
    world: Record<string, { description: string; visits: number }>;
    china: Record<string, { description: string; visits: number }>;
  };
};

type Honor = {
  title: string;
  description: string;
  date: string;
};

type AboutProps = {
  travelData: TravelData;
  honorsData: Honor[];
};

export async function getStaticProps() {
  const travelData = getTravelData();
  const honorsData = getHonorsData();
  return {
    props: { travelData, honorsData },
  };
}

export default function About({ travelData, honorsData }: AboutProps) {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [mapScope, setMapScope] = useState<'world' | 'china'>('world');
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    const bg = isDarkMode ? '#050505' : '#F9F9F9';
    document.body.style.backgroundColor = bg;
    document.documentElement.style.backgroundColor = bg;
  }, [isDarkMode]);

  useEffect(() => {
    const loadMapData = async () => {
      try {
        const worldRes = await fetch('/world.json');
        const chinaRes = await fetch('/china.json');
        if (!worldRes.ok || !chinaRes.ok) return;
        const worldJson = await worldRes.json();
        const chinaJson = await chinaRes.json();
        echarts.registerMap('world', worldJson);
        echarts.registerMap('china', chinaJson);
        setMapLoaded(true);
      } catch (err) {
        console.error('Map loading failed:', err);
      }
    };
    loadMapData();
  }, []);

  const theme = {
    wrapper: isDarkMode ? 'bg-[#050505] text-white' : 'bg-[#F9F9F9] text-[#1a1a1a]',
    titleColor: isDarkMode ? 'text-white' : 'text-black',
    textColor: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    subText: isDarkMode ? 'text-gray-500' : 'text-gray-400',
    card: isDarkMode
      ? 'bg-[#1a1a1a]/80 backdrop-blur-md border border-white/5 shadow-xl'
      : 'bg-white/80 backdrop-blur-md border border-black/5 shadow-sm hover:shadow-md',
    pillActive: isDarkMode 
      ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.4)]'
      : 'bg-black text-white shadow-lg',
    pillInactive: isDarkMode
      ? 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
      : 'bg-black/5 text-gray-600 hover:bg-black/10 hover:text-black',
    divider: isDarkMode ? 'border-white/10' : 'border-black/10',
    mapBg: 'transparent',
    mapAreaColor: isDarkMode ? '#222' : '#e0e0e0',
    mapBorderColor: isDarkMode ? '#333' : '#fff',
    mapHighlight: isDarkMode ? '#ffffff' : '#111111',
    mapHighlightShadow: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.3)',
  };

  const getOption = () => {
    if (!mapLoaded) return {};

    const detailsData = travelData.details[mapScope === 'world' ? 'world' : 'china'];
    const visitedList = Object.keys(detailsData);
    
    const data = visitedList.map(name => ({
      name: name,
      value: detailsData[name].visits,
      details: detailsData[name].description,
      itemStyle: {
        areaColor: theme.mapHighlight,
        shadowBlur: 15,
        shadowColor: theme.mapHighlightShadow
      }
    }));

    return {
      backgroundColor: theme.mapBg,
      tooltip: {
        trigger: 'item',
        backgroundColor: isDarkMode ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)',
        borderColor: isDarkMode ? '#333' : '#ddd',
        textStyle: { color: isDarkMode ? '#fff' : '#000' },
        // [修改2] 添加了 eslint-disable-line 来忽略 any 类型检查
        formatter: (params: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
          if (!params.data) return params.name;
          const info = params.data;
          return `
            <div style="font-weight:bold; margin-bottom:4px;">${params.name}</div>
            <div style="font-size:12px; opacity:0.8;">Visits: ${info.value}</div>
            ${info.details ? `<div style="font-size:12px; opacity:0.8; margin-top:2px;">${info.details}</div>` : ''}
          `;
        }
      },
      geo: {
        map: mapScope,
        roam: true,
        
        center: mapScope === 'world' 
          ? [150, 25]  
          : [105, 36], 
        
        zoom: 1.2, 

        label: { show: false },
        itemStyle: {
          areaColor: theme.mapAreaColor,
          borderColor: theme.mapBorderColor,
          borderWidth: 1,
        },
        emphasis: {
          itemStyle: {
            areaColor: theme.mapHighlight,
            shadowBlur: 10,
            shadowColor: theme.mapHighlightShadow
          },
          label: { show: false }
        }
      },
      series: [
        {
          type: 'map',
          geoIndex: 0,
          data: data,
        }
      ]
    };
  };

  const totalPlaces = Object.keys(travelData.details[mapScope === 'world' ? 'world' : 'china']).length;

  return (
    <>
      <Head>
        <title>About | Plote Motion Field</title>
      </Head>

      <div className={`min-h-screen transition-colors duration-500 font-sans selection:bg-purple-500/30 flex flex-col ${theme.wrapper}`}>
        <Header isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />

        <main className="flex-grow pt-32 md:pt-40 px-4 md:px-10 lg:px-20 pb-20 max-w-7xl mx-auto w-full">
          
          {/* 1. Title & Intro */}
          <header className="mb-16 text-center md:text-left">
            <motion.h1 
              className={`text-5xl md:text-7xl font-bold tracking-tighter mb-6 leading-tight ${theme.titleColor}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              About Me
            </motion.h1>
            <motion.div 
              className={`p-8 rounded-3xl ${theme.card}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <p className={`text-lg leading-relaxed ${theme.textColor}`}>
                I am a passionate researcher and developer navigating the spaces between generative AI, cognitive science, and interactive design. This page chronicles my journey—both geographically and academically.
              </p>
            </motion.div>
          </header>

          {/* 2. Travel Map Section */}
          <section className="mb-20">
            <div className="flex items-center justify-between mb-8">
              <h2 className={`text-3xl font-bold ${theme.titleColor} flex items-center gap-3`}>
                <Globe className="w-6 h-6 opacity-70" />
                Footprints
              </h2>
              
              {/* Map Switcher */}
              <div className="flex gap-2">
                {(['world', 'china'] as const).map((scope) => (
                  <button
                    key={scope}
                    onClick={() => setMapScope(scope)}
                    className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${
                      mapScope === scope ? theme.pillActive : theme.pillInactive
                    }`}
                  >
                    {scope.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Map Container */}
            <motion.div 
              className={`relative w-full h-[500px] rounded-3xl overflow-hidden flex items-center justify-center ${theme.card}`}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              {mapLoaded ? (
                <ReactECharts 
                  option={getOption()} 
                  style={{ height: '100%', width: '100%' }}
                  opts={{ renderer: 'svg' }}
                  notMerge={true} 
                  lazyUpdate={true}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-sm opacity-50">
                  Loading Cartography...
                </div>
              )}
            </motion.div>
            
            <div className="mt-6 flex justify-between items-center px-4">
               <div className={`flex items-center gap-2 text-sm font-mono ${theme.subText}`}>
                 <MapPin size={14} />
                 <span>Total Locations</span>
               </div>
               <div className={`text-lg font-bold ${theme.titleColor}`}>
                 {totalPlaces} <span className="text-sm font-normal opacity-60">visited</span>
               </div>
            </div>
          </section>

          {/* 3. Honors & Awards Section */}
          <section>
            <h2 className={`text-3xl font-bold ${theme.titleColor} mb-8 flex items-center gap-3`}>
              <Trophy className="w-6 h-6 opacity-70" />
              Honors & Awards
            </h2>
            
            <div className="grid grid-cols-1 gap-4">
              {honorsData.map((honor, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${theme.card}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`mt-1 p-2 rounded-full ${isDarkMode ? 'bg-white/10' : 'bg-black/5'}`}>
                      <Award size={20} className={theme.textColor} />
                    </div>
                    <div>
                      <h3 className={`text-lg font-bold ${theme.titleColor}`}>{honor.title}</h3>
                      <p className={`text-sm ${theme.subText}`}>{honor.description}</p>
                    </div>
                  </div>
                  <div className={`text-xs font-mono px-4 py-1.5 rounded-full border ${isDarkMode ? 'border-white/10 text-gray-400 bg-white/5' : 'border-black/10 text-gray-500 bg-black/5'}`}>
                    {honor.date || 'Award'} 
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

        </main>

      </div>
    </>
  );
}