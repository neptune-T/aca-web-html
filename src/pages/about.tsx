'use client';

import { FaTrophy, FaGlobeAmericas, FaMapMarkedAlt } from 'react-icons/fa';
import dynamic from 'next/dynamic';
import * as echarts from 'echarts';
import { useEffect, useState, Suspense, useRef } from 'react';

// Dynamic import for client-side only
const EChartsReactCore = dynamic(() => import('echarts-for-react').then(mod => mod.default), { ssr: false });

// 示例数据 - 去过的地方（国家和中国省份）
const visitedPlaces = {
  // 世界地图数据 - 国家级别
  world: {
    2022: ['China', 'Japan'],
    2023: ['China', 'United States', 'France'],
    2024: ['China', 'United States', 'Japan', 'France', 'Germany', 'Australia'],
    2025: ['China', 'Canada', 'United Kingdom', 'Italy', 'Spain']
  },
  // 中国地图数据 - 省份级别
  china: {
    2022: ['北京', '上海'],
    2023: ['北京', '上海', '广东', '江苏'],
    2024: ['北京', '上海', '广东', '江苏', '浙江', '四川', '陕西'],
    2025: ['北京', '上海', '广东', '江苏', '浙江', '四川', '陕西', '云南', '湖南', '湖北']
  }
};

// 地点详细信息
const placeDetails = {
  // 国家信息
  world: {
    'China': { description: '商务旅行和旅游', visits: 5 },
    'United States': { description: '学术会议和考察', visits: 3 },
    'Japan': { description: '度假和科技考察', visits: 2 },
    'France': { description: '文化交流', visits: 2 },
    'Germany': { description: '技术考察', visits: 1 },
    'Australia': { description: '留学交流', visits: 1 },
    'Canada': { description: '探亲和旅游', visits: 1 },
    'United Kingdom': { description: '学术访问', visits: 1 },
    'Italy': { description: '艺术之旅', visits: 1 },
    'Spain': { description: '度假', visits: 1 }
  },
  // 中国省份信息
  china: {
    '北京': { description: '参加会议和观光', visits: 8 },
    '上海': { description: '商务出差和旅游', visits: 6 },
    '广东': { description: '家庭旅行和商务', visits: 4 },
    '江苏': { description: '学术交流和技术考察', visits: 3 },
    '浙江': { description: '技术培训和旅游', visits: 2 },
    '四川': { description: '美食和文化之旅', visits: 2 },
    '陕西': { description: '历史文化探索', visits: 1 },
    '云南': { description: '自然风光摄影', visits: 1 },
    '湖南': { description: '学术会议', visits: 1 },
    '湖北': { description: '商务洽谈', visits: 1 }
  }
};

const About = () => {
  const [currentYear, setCurrentYear] = useState('2024');
  const [currentMap, setCurrentMap] = useState<'world' | 'china'>('world');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [hoveredYear, setHoveredYear] = useState<string | null>(null);
  const [hoveredPlace, setHoveredPlace] = useState<string | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // 获取所有可用年份
  const allYears = Object.keys(visitedPlaces.world).sort();
  const currentYearIndex = allYears.indexOf(currentYear);

  // 动态生成地图配置
  const getMapOption = () => {
    const mapType = currentMap;
    const places = visitedPlaces[mapType][currentYear] || [];
    const mapData = places.map(name => ({
      name,
      value: 1,
      ...placeDetails[mapType][name]
    }));

    return {
      backgroundColor: '#1a1a1a',
      title: { 
        text: `${currentYear}年访问过的${mapType === 'world' ? '国家' : '省份'}`,
        textStyle: { color: '#fff', fontSize: 16 },
        left: 'center'
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: '#777',
        borderWidth: 1,
        textStyle: { color: '#fff' },
        formatter: (params: any) => {
          const { name, data } = params;
          if (data) {
            return `
              <div style="padding: 8px; max-width: 250px;">
                <div style="font-size: 16px; font-weight: bold; margin-bottom: 5px; color: #4fc3f7">${name}</div>
                <div style="margin-bottom: 3px;"><span style="color: #bbb">描述:</span> ${data.description}</div>
                <div><span style="color: #bbb">访问次数:</span> ${data.visits}</div>
              </div>
            `;
          }
          return name;
        }
      },
      series: [{
        type: 'map',
        map: mapType,
        roam: true,
        zoom: mapType === 'world' ? 1.2 : 1.1,
        center: mapType === 'world' ? [30, 30] : [105, 38],
        emphasis: {
          label: {
            show: true,
            color: '#fff',
            fontSize: 12,
            fontWeight: 'bold',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: [4, 8]
          },
          itemStyle: {
            areaColor: '#ff6b6b',
            shadowBlur: 15,
            shadowColor: 'rgba(255, 255, 255, 0.8)',
            borderWidth: 2,
            borderColor: '#fff'
          }
        },
        itemStyle: {
          areaColor: '#2c3e50',
          borderColor: '#34495e',
          borderWidth: 0.5
        },
        data: mapData,
        nameMap: mapType === 'china' ? {
          '北京': '北京', '上海': '上海', '广东': '广东', '江苏': '江苏', 
          '浙江': '浙江', '四川': '四川', '陕西': '陕西', '云南': '云南', 
          '湖南': '湖南', '湖北': '湖北'
        } : undefined
      }],
      visualMap: {
        type: 'piecewise',
        pieces: [
          { value: 1, label: '已访问', color: '#3498db' },
          { value: 0, label: '未访问', color: '#2c3e50' }
        ],
        textStyle: { color: '#fff' },
        left: 'right',
        top: 'bottom',
        orient: 'vertical'
      }
    };
  };

  // 加载地图数据
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadMaps = async () => {
      try {
        const [worldRes, chinaRes] = await Promise.all([
          fetch('/world.json'),
          fetch('/china.json')
        ]);
        
        if (!worldRes.ok || !chinaRes.ok) throw new Error('Failed to fetch map data');
        
        const [worldJson, chinaJson] = await Promise.all([
          worldRes.json(),
          chinaRes.json()
        ]);
        
        echarts.registerMap('world', worldJson);
        echarts.registerMap('china', chinaJson);
        console.log('Maps registered successfully');
        setMapLoaded(true);
      } catch (error) {
        console.error('Error loading map data:', error);
      }
    };

    loadMaps();
  }, []);

  // 处理地图事件
  const onChartEvents = {
    mouseover: (params: any) => {
      if (params.data) {
        setHoveredPlace(params.name);
      }
    },
    mouseout: () => {
      setHoveredPlace(null);
    }
  };

  return (
    <div className="min-h-screen text-gray-200">
      <main className="pt-28 pb-16 container mx-auto px-6 max-w-6xl">
        <h1 className="text-5xl font-bold font-ibm-plex-serif text-white mb-8">About Me</h1>
        
        <section className="mb-12 bg-black/20 backdrop-blur-sm p-8 rounded-lg">
          <p className="text-lg leading-relaxed text-gray-300">
            I am a passionate student with a deep interest in the intersection of mathematics, physics, and artificial intelligence.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-gray-300">
            This page contains my academic profile, curriculum vitae, and contact information.
          </p>
        </section>

        {/* Honors and Awards Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-100 mb-6 flex items-center">
            <FaTrophy className="mr-3 text-klein-blue" />
            Honors & Awards
          </h2>
          <div className="space-y-4">
            <div className="p-4 border-l-4 border-pku-red bg-black/20 backdrop-blur-sm rounded-r-lg">
              <p className="font-semibold text-lg text-gray-100">Bronze Medal</p>
              <p className="text-gray-400"> ICPC Invitational</p>
            </div>
            <div className="p-4 border-l-4 border-klein-blue bg-black/20 backdrop-blur-sm rounded-r-lg">
              <p className="font-semibold text-lg text-gray-100">National Silver Medal</p>
              <p className="text-gray-400">Chinese Mathematical Olympiad (CMO), 2021</p>
            </div>
            <div className="p-4 border-l-4 border-pku-red bg-black/20 backdrop-blur-sm rounded-r-lg">
              <p className="font-semibold text-lg text-gray-100">First Prize (Provincial Level)</p>
              <p className="text-gray-400">Chinese Chemistry Olympiad (CChO), 2020</p>
            </div>
          </div>
        </section>

        {/* 旅行地图部分 */}
        <section className="mb-12 bg-black/20 backdrop-blur-sm p-8 rounded-lg">
          <h2 className="text-3xl font-bold text-gray-100 mb-6">Places I've Visited</h2>
          
          {/* 地图切换选项卡 */}
          <div className="flex mb-6 border-b border-gray-700">
            <button 
              onClick={() => setCurrentMap('world')}
              className={`flex items-center px-6 py-3 font-semibold transition-all border-b-2 ${
                currentMap === 'world' 
                  ? 'border-blue-500 text-blue-400 bg-blue-900/20' 
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <FaGlobeAmericas className="mr-2" />
              世界地图
            </button>
            <button 
              onClick={() => setCurrentMap('china')}
              className={`flex items-center px-6 py-3 font-semibold transition-all border-b-2 ${
                currentMap === 'china' 
                  ? 'border-red-500 text-red-400 bg-red-900/20' 
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <FaMapMarkedAlt className="mr-2" />
              中国地图
            </button>
          </div>

          {/* 地图容器 */}
          <div className="h-96 w-full mb-8 rounded-lg overflow-hidden border border-gray-700 bg-gray-900">
            <Suspense fallback={
              <div className="h-full flex items-center justify-center">
                <p className="text-xl text-gray-400">Loading map...</p>
              </div>
            }>
              {mapLoaded ? (
                <EChartsReactCore 
                  option={getMapOption()} 
                  style={{ height: '100%', width: '100%' }} 
                  opts={{ renderer: 'canvas' }}
                  onEvents={onChartEvents}
                />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-xl text-gray-400">Loading map data...</p>
                </div>
              )}
            </Suspense>
          </div>

          {/* 时间轴式年份选择器 - 宽度与地图一致 */}
          <div ref={timelineRef} className="relative mt-12 mb-20 w-full">
            {/* 时间轴线 */}
            <div className="absolute left-0 right-0 top-2 h-0.5 bg-gray-700 transform -translate-y-1/2"></div>
            
            <div className="relative flex justify-between">
              {allYears.map((year, index) => (
                <div 
                  key={year}
                  className="relative flex flex-col items-center"
                  style={{ 
                    left: `${(index / (allYears.length - 1)) * 100}%`,
                    transform: 'translateX(-50%)',
                    position: 'absolute'
                  }}
                >
                  {/* 时间轴点 */}
                  <button
                    onClick={() => setCurrentYear(year)}
                    onMouseEnter={() => setHoveredYear(year)}
                    onMouseLeave={() => setHoveredYear(null)}
                    className={`relative z-10 w-6 h-6 rounded-full transition-all duration-300 ${
                      currentYear === year 
                        ? 'bg-blue-500 shadow-lg shadow-blue-500/50 scale-125' 
                        : 'bg-gray-600 hover:bg-gray-500'
                    }`}
                  >
                    {/* 悬浮提示 */}
                    {/* {(hoveredYear === year || currentYear === year) && (
                      <div className="absolute bottom-full mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded-md whitespace-nowrap">
                        {year}年
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                      </div>
                    )} */}
                  </button>
                  
                  {/* 年份标签 */}
                  <span className={`mt-2 text-sm transition-all ${
                    currentYear === year ? 'text-blue-400 font-bold' : 'text-gray-500'
                  }`}>
                    {year}
                  </span>
                  
                  {/* 当前年份指示器 */}
                  {currentYear === year && (
                    <div className="absolute top-full mt-1 w-3 h-3 transform rotate-45 bg-blue-500"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 地点介绍面板 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-gray-900/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-100 mb-3">
                {hoveredPlace ? '地点详情' : '访问统计'}
              </h3>
              <div className="space-y-2">
                {hoveredPlace ? (
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">{hoveredPlace}</h4>
                    <p className="text-gray-300 mb-2">
                      <strong>描述:</strong> {placeDetails[currentMap][hoveredPlace]?.description || '暂无描述'}
                    </p>
                    <p className="text-gray-300">
                      <strong>访问次数:</strong> {placeDetails[currentMap][hoveredPlace]?.visits || 1}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-400">当前年份:</span>
                      <span className="text-blue-400">{currentYear}年</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">访问的{currentMap === 'world' ? '国家' : '省份'}:</span>
                      <span className="text-green-400">{visitedPlaces[currentMap][currentYear]?.length || 0}个</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">地图类型:</span>
                      <span className="text-yellow-400">{currentMap === 'world' ? '世界地图' : '中国地图'}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div className="bg-gray-900/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-100 mb-3">使用提示</h3>
              <ul className="text-gray-400 text-sm space-y-1">
                <li>• 蓝色区域表示已访问的地方</li>
                <li>• 鼠标悬停在地图上查看详细信息</li>
                <li>• 使用鼠标滚轮缩放地图</li>
                <li>• 拖拽地图可以平移视图</li>
                <li>• 点击时间轴点切换年份</li>
                <li>• 在世界地图中点击中国可查看省份详情</li>
              </ul>
            </div>
          </div>

          {/* 当前年份的地点列表 */}
          <div className="mt-6">
            <h3 className="text-xl font-bold text-gray-100 mb-4">
              {currentYear}年访问的{currentMap === 'world' ? '国家' : '省份'}
            </h3>
            <div className="bg-gray-900/50 rounded-lg p-4">
              <div className="flex flex-wrap gap-2">
                {(visitedPlaces[currentMap][currentYear] || []).map((place, index) => (
                  <div 
                    key={index}
                    className={`flex items-center py-2 px-3 rounded transition-colors cursor-pointer ${
                      hoveredPlace === place ? 'bg-blue-900/50' : 'bg-gray-800/50'
                    }`}
                    onMouseEnter={() => setHoveredPlace(place)}
                    onMouseLeave={() => setHoveredPlace(null)}
                  >
                    <span className="text-gray-200">{place}</span>
                    <span className="ml-2 text-blue-400 text-sm bg-blue-900/30 px-2 py-1 rounded">
                      {placeDetails[currentMap][place]?.visits || 1}次
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default About;