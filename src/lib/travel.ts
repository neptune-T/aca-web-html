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
        // 你提供的“城市列表”已聚合成省级（ECharts 默认中国地图是省级粒度）
        "北京": { visits: 10, description: "北京" },
        "上海": { visits: 3, description: "上海" },
        "辽宁": { visits: 2, description: "大连 / 沈阳" },
        "吉林": { visits: 1, description: "长春" },
        "甘肃": { visits: 1, description: "兰州 / 张掖 / 武威 / 嘉峪关" },
        "山东": { visits: 2, description: "威海 / 青岛" },
        "江西": { visits: 1, description: "南昌" },
        "江苏": { visits: 5, description: "南京 / 苏州 / 无锡 / 常州 / 扬州 / 徐州 / 连云港 " },
        "安徽": { visits: 2, description: "黄山 / 合肥" },
        "河南": { visits: 1, description: "郑州" },
        "浙江": { visits: 2, description: "杭州 / 嘉兴" },
        "陕西": { visits: 3, description: "西安 / 咸阳 / 宝鸡 / 延安" },
        "河北": { visits: 2, description: "唐山 / 石家庄 / 张家口 / 承德" },
        "新疆": { visits: 1, description: "伊犁" },
        "宁夏": { visits: 1, description: "中卫" },
        "内蒙古": { visits: 1, description: "赤峰" },
        "山西": { visits: 1, description: "临汾" },
        "青海": { visits: 1, description: "西宁" },

      }
    }
  };
}