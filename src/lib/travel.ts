export function getTravelData() {
  return {
    // 这里是统计数据，可以保留为空，或者用于其他逻辑
    world: {}, 
    china: {},

    // --- 核心配置区：在这里添加你去过的地方 ---
    details: {
      // 1. 世界地图配置 (使用英文国家名)
      world: {
        "China": { 
          visits: 99, 
          description: "My Homeland" 
        },
        "Japan": { 
          visits: 3, 
          description: "Kyoto, Tokyo, Osaka" 
        },
        "United States": { 
          visits: 2, 
          description: "Academic Conferences" 
        },
        "Australia": { 
          visits: 1, 
          description: "Gold Coast vacation" 
        },
        "United Kingdom": {
          visits: 1,
          description: "London & Cambridge"
        }
        // 在这里添加更多国家: "Country Name": { ... }
      },

      // 2. 中国地图配置 (使用中文省份名)
      china: {
        "北京": { 
          visits: 10, 
          description: "Education & Research" 
        },
        "上海": { 
          visits: 5, 
          description: "City Walk" 
        },
        "四川": { 
          visits: 2, 
          description: "Pandas & Hotpot" 
        },
        "广东": { 
          visits: 4, 
          description: "Dim Sum" 
        },
        "香港": {
          visits: 2,
          description: "Victoria Harbour"
        }
        // 在这里添加更多省份: "省份名": { ... }
      }
    }
  };
}