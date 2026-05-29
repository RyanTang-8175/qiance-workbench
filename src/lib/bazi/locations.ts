// 全国主要区县经纬度数据库
// 格式：省-市-区县 → { lat, lng }
export const LOCATION_DB: Record<string, { lat: number; lng: number; province: string; city: string }> = {
  // ===== 北京 =====
  "北京-东城区": { lat: 39.93, lng: 116.42, province: "北京", city: "北京" },
  "北京-西城区": { lat: 39.91, lng: 116.37, province: "北京", city: "北京" },
  "北京-朝阳区": { lat: 39.92, lng: 116.49, province: "北京", city: "北京" },
  "北京-海淀区": { lat: 39.96, lng: 116.31, province: "北京", city: "北京" },
  "北京-丰台区": { lat: 39.86, lng: 116.29, province: "北京", city: "北京" },
  "北京-石景山区": { lat: 39.91, lng: 116.22, province: "北京", city: "北京" },
  "北京-通州区": { lat: 39.90, lng: 116.66, province: "北京", city: "北京" },
  "北京-顺义区": { lat: 40.13, lng: 116.65, province: "北京", city: "北京" },
  "北京-昌平区": { lat: 40.22, lng: 116.23, province: "北京", city: "北京" },
  "北京-大兴区": { lat: 39.73, lng: 116.34, province: "北京", city: "北京" },
  "北京-房山区": { lat: 39.75, lng: 116.14, province: "北京", city: "北京" },
  "北京-门头沟区": { lat: 39.94, lng: 116.10, province: "北京", city: "北京" },
  "北京-平谷区": { lat: 40.17, lng: 117.12, province: "北京", city: "北京" },
  "北京-密云区": { lat: 40.38, lng: 116.84, province: "北京", city: "北京" },
  "北京-延庆区": { lat: 40.45, lng: 115.97, province: "北京", city: "北京" },
  "北京-怀柔区": { lat: 40.32, lng: 116.63, province: "北京", city: "北京" },

  // ===== 上海 =====
  "上海-黄浦区": { lat: 31.23, lng: 121.49, province: "上海", city: "上海" },
  "上海-徐汇区": { lat: 31.19, lng: 121.44, province: "上海", city: "上海" },
  "上海-长宁区": { lat: 31.22, lng: 121.42, province: "上海", city: "上海" },
  "上海-静安区": { lat: 31.23, lng: 121.45, province: "上海", city: "上海" },
  "上海-普陀区": { lat: 31.25, lng: 121.40, province: "上海", city: "上海" },
  "上海-虹口区": { lat: 31.26, lng: 121.51, province: "上海", city: "上海" },
  "上海-杨浦区": { lat: 31.26, lng: 121.53, province: "上海", city: "上海" },
  "上海-浦东新区": { lat: 31.23, lng: 121.54, province: "上海", city: "上海" },
  "上海-闵行区": { lat: 31.11, lng: 121.38, province: "上海", city: "上海" },
  "上海-宝山区": { lat: 31.40, lng: 121.49, province: "上海", city: "上海" },
  "上海-嘉定区": { lat: 31.39, lng: 121.27, province: "上海", city: "上海" },
  "上海-松江区": { lat: 31.03, lng: 121.23, province: "上海", city: "上海" },
  "上海-青浦区": { lat: 31.15, lng: 121.12, province: "上海", city: "上海" },
  "上海-奉贤区": { lat: 30.92, lng: 121.47, province: "上海", city: "上海" },
  "上海-金山区": { lat: 30.74, lng: 121.34, province: "上海", city: "上海" },
  "上海-崇明区": { lat: 31.62, lng: 121.40, province: "上海", city: "上海" },

  // ===== 广东 =====
  "广州-越秀区": { lat: 23.13, lng: 113.27, province: "广东", city: "广州" },
  "广州-天河区": { lat: 23.13, lng: 113.36, province: "广东", city: "广州" },
  "广州-海珠区": { lat: 23.09, lng: 113.32, province: "广东", city: "广州" },
  "广州-荔湾区": { lat: 23.13, lng: 113.24, province: "广东", city: "广州" },
  "广州-白云区": { lat: 23.27, lng: 113.27, province: "广东", city: "广州" },
  "广州-黄埔区": { lat: 23.11, lng: 113.46, province: "广东", city: "广州" },
  "广州-番禺区": { lat: 22.94, lng: 113.36, province: "广东", city: "广州" },
  "广州-花都区": { lat: 23.40, lng: 113.22, province: "广东", city: "广州" },
  "广州-南沙区": { lat: 22.80, lng: 113.53, province: "广东", city: "广州" },
  "广州-增城区": { lat: 23.29, lng: 113.83, province: "广东", city: "广州" },
  "广州-从化区": { lat: 23.55, lng: 113.58, province: "广东", city: "广州" },
  "深圳-福田区": { lat: 22.52, lng: 114.05, province: "广东", city: "深圳" },
  "深圳-罗湖区": { lat: 22.55, lng: 114.13, province: "广东", city: "深圳" },
  "深圳-南山区": { lat: 22.53, lng: 113.93, province: "广东", city: "深圳" },
  "深圳-宝安区": { lat: 22.55, lng: 113.88, province: "广东", city: "深圳" },
  "深圳-龙岗区": { lat: 22.72, lng: 114.25, province: "广东", city: "深圳" },
  "深圳-龙华区": { lat: 22.66, lng: 114.05, province: "广东", city: "深圳" },
  "深圳-光明区": { lat: 22.75, lng: 113.94, province: "广东", city: "深圳" },
  "深圳-坪山区": { lat: 22.72, lng: 114.35, province: "广东", city: "深圳" },
  "深圳-盐田区": { lat: 22.56, lng: 114.24, province: "广东", city: "深圳" },
  "东莞-莞城区": { lat: 23.04, lng: 113.75, province: "广东", city: "东莞" },
  "东莞-南城区": { lat: 23.02, lng: 113.75, province: "广东", city: "东莞" },
  "东莞-东城区": { lat: 23.05, lng: 113.78, province: "广东", city: "东莞" },
  "佛山-禅城区": { lat: 23.01, lng: 113.12, province: "广东", city: "佛山" },
  "佛山-南海区": { lat: 23.03, lng: 113.14, province: "广东", city: "佛山" },
  "佛山-顺德区": { lat: 22.85, lng: 113.29, province: "广东", city: "佛山" },
  "珠海-香洲区": { lat: 22.27, lng: 113.58, province: "广东", city: "珠海" },
  "中山-石岐区": { lat: 22.52, lng: 113.38, province: "广东", city: "中山" },
  "惠州-惠城区": { lat: 23.10, lng: 114.42, province: "广东", city: "惠州" },

  // ===== 浙江 =====
  "杭州-上城区": { lat: 30.25, lng: 120.17, province: "浙江", city: "杭州" },
  "杭州-下城区": { lat: 30.28, lng: 120.17, province: "浙江", city: "杭州" },
  "杭州-西湖区": { lat: 30.27, lng: 120.13, province: "浙江", city: "杭州" },
  "杭州-滨江区": { lat: 30.21, lng: 120.21, province: "浙江", city: "杭州" },
  "杭州-萧山区": { lat: 30.17, lng: 120.26, province: "浙江", city: "杭州" },
  "杭州-余杭区": { lat: 30.29, lng: 120.30, province: "浙江", city: "杭州" },
  "杭州-临平区": { lat: 30.42, lng: 120.30, province: "浙江", city: "杭州" },
  "杭州-富阳区": { lat: 30.05, lng: 119.95, province: "浙江", city: "杭州" },
  "杭州-临安区": { lat: 30.23, lng: 119.72, province: "浙江", city: "杭州" },
  "杭州-拱墅区": { lat: 30.31, lng: 120.13, province: "浙江", city: "杭州" },
  "宁波-海曙区": { lat: 29.87, lng: 121.55, province: "浙江", city: "宁波" },
  "宁波-鄞州区": { lat: 29.84, lng: 121.54, province: "浙江", city: "宁波" },
  "宁波-江北区": { lat: 29.89, lng: 121.55, province: "浙江", city: "宁波" },
  "宁波-镇海区": { lat: 29.95, lng: 121.72, province: "浙江", city: "宁波" },
  "宁波-北仑区": { lat: 29.90, lng: 121.84, province: "浙江", city: "宁波" },
  "温州-鹿城区": { lat: 28.01, lng: 120.65, province: "浙江", city: "温州" },
  "温州-龙湾区": { lat: 27.93, lng: 120.81, province: "浙江", city: "温州" },
  "温州-瓯海区": { lat: 27.97, lng: 120.63, province: "浙江", city: "温州" },
  "嘉兴-南湖区": { lat: 30.77, lng: 120.75, province: "浙江", city: "嘉兴" },
  "湖州-吴兴区": { lat: 30.87, lng: 120.09, province: "浙江", city: "湖州" },
  "绍兴-越城区": { lat: 30.01, lng: 120.58, province: "浙江", city: "绍兴" },
  "金华-婺城区": { lat: 29.08, lng: 119.65, province: "浙江", city: "金华" },
  "台州-椒江区": { lat: 28.67, lng: 121.44, province: "浙江", city: "台州" },

  // ===== 江苏 =====
  "南京-玄武区": { lat: 32.07, lng: 118.80, province: "江苏", city: "南京" },
  "南京-秦淮区": { lat: 32.03, lng: 118.79, province: "江苏", city: "南京" },
  "南京-鼓楼区": { lat: 32.07, lng: 118.77, province: "江苏", city: "南京" },
  "南京-建邺区": { lat: 32.03, lng: 118.76, province: "江苏", city: "南京" },
  "南京-栖霞区": { lat: 32.11, lng: 118.88, province: "江苏", city: "南京" },
  "南京-江宁区": { lat: 31.95, lng: 118.84, province: "江苏", city: "南京" },
  "南京-浦口区": { lat: 32.06, lng: 118.63, province: "江苏", city: "南京" },
  "苏州-姑苏区": { lat: 31.31, lng: 120.62, province: "江苏", city: "苏州" },
  "苏州-虎丘区": { lat: 31.30, lng: 120.57, province: "江苏", city: "苏州" },
  "苏州-吴中区": { lat: 31.26, lng: 120.63, province: "江苏", city: "苏州" },
  "苏州-相城区": { lat: 31.37, lng: 120.64, province: "江苏", city: "苏州" },
  "苏州-吴江区": { lat: 31.17, lng: 120.64, province: "江苏", city: "苏州" },
  "苏州-工业园区": { lat: 31.32, lng: 120.72, province: "江苏", city: "苏州" },
  "无锡-梁溪区": { lat: 31.57, lng: 120.30, province: "江苏", city: "无锡" },
  "无锡-新吴区": { lat: 31.55, lng: 120.37, province: "江苏", city: "无锡" },
  "无锡-锡山区": { lat: 31.62, lng: 120.36, province: "江苏", city: "无锡" },
  "无锡-惠山区": { lat: 31.68, lng: 120.30, province: "江苏", city: "无锡" },
  "常州-天宁区": { lat: 31.75, lng: 119.97, province: "江苏", city: "常州" },
  "常州-钟楼区": { lat: 31.74, lng: 119.94, province: "江苏", city: "常州" },
  "常州-新北区": { lat: 31.83, lng: 119.97, province: "江苏", city: "常州" },
  "常州-武进区": { lat: 31.70, lng: 119.94, province: "江苏", city: "常州" },
  "南通-崇川区": { lat: 32.01, lng: 120.86, province: "江苏", city: "南通" },
  "扬州-广陵区": { lat: 32.39, lng: 119.43, province: "江苏", city: "扬州" },
  "徐州-云龙区": { lat: 34.26, lng: 117.19, province: "江苏", city: "徐州" },
  "盐城-亭湖区": { lat: 33.39, lng: 120.13, province: "江苏", city: "盐城" },
  "镇江-京口区": { lat: 32.20, lng: 119.45, province: "江苏", city: "镇江" },
  "泰州-海陵区": { lat: 32.49, lng: 119.92, province: "江苏", city: "泰州" },
  "连云港-海州区": { lat: 34.57, lng: 119.18, province: "江苏", city: "连云港" },
  "淮安-清江浦区": { lat: 33.55, lng: 119.03, province: "江苏", city: "淮安" },
  "宿迁-宿城区": { lat: 33.96, lng: 118.28, province: "江苏", city: "宿迁" },

  // ===== 四川 =====
  "成都-锦江区": { lat: 30.66, lng: 104.08, province: "四川", city: "成都" },
  "成都-青羊区": { lat: 30.67, lng: 104.06, province: "四川", city: "成都" },
  "成都-武侯区": { lat: 30.64, lng: 104.04, province: "四川", city: "成都" },
  "成都-成华区": { lat: 30.66, lng: 104.10, province: "四川", city: "成都" },
  "成都-金牛区": { lat: 30.69, lng: 104.05, province: "四川", city: "成都" },
  "成都-高新区": { lat: 30.59, lng: 104.06, province: "四川", city: "成都" },
  "成都-龙泉驿区": { lat: 30.56, lng: 104.27, province: "四川", city: "成都" },
  "成都-新都区": { lat: 30.83, lng: 104.16, province: "四川", city: "成都" },
  "成都-温江区": { lat: 30.68, lng: 103.85, province: "四川", city: "成都" },
  "成都-双流区": { lat: 30.57, lng: 103.92, province: "四川", city: "成都" },
  "成都-郫都区": { lat: 30.79, lng: 103.88, province: "四川", city: "成都" },
  "成都-天府新区": { lat: 30.50, lng: 104.06, province: "四川", city: "成都" },
  "绵阳-涪城区": { lat: 31.47, lng: 104.73, province: "四川", city: "绵阳" },
  "绵阳-游仙区": { lat: 31.49, lng: 104.77, province: "四川", city: "绵阳" },

  // ===== 湖北 =====
  "武汉-武昌区": { lat: 30.56, lng: 114.34, province: "湖北", city: "武汉" },
  "武汉-洪山区": { lat: 30.50, lng: 114.34, province: "湖北", city: "武汉" },
  "武汉-江岸区": { lat: 30.60, lng: 114.30, province: "湖北", city: "武汉" },
  "武汉-江汉区": { lat: 30.60, lng: 114.27, province: "湖北", city: "武汉" },
  "武汉-汉阳区": { lat: 30.55, lng: 114.22, province: "湖北", city: "武汉" },
  "武汉-硚口区": { lat: 30.57, lng: 114.21, province: "湖北", city: "武汉" },
  "武汉-东西湖区": { lat: 30.65, lng: 114.13, province: "湖北", city: "武汉" },
  "武汉-江夏区": { lat: 30.37, lng: 114.32, province: "湖北", city: "武汉" },
  "武汉-黄陂区": { lat: 30.88, lng: 114.38, province: "湖北", city: "武汉" },
  "武汉-新洲区": { lat: 30.84, lng: 114.80, province: "湖北", city: "武汉" },
  "武汉-青山区": { lat: 30.63, lng: 114.39, province: "湖北", city: "武汉" },
  "武汉-蔡甸区": { lat: 30.58, lng: 113.97, province: "湖北", city: "武汉" },
  "武汉-东湖高新区": { lat: 30.49, lng: 114.40, province: "湖北", city: "武汉" },

  // ===== 湖南 =====
  "长沙-岳麓区": { lat: 28.23, lng: 112.93, province: "湖南", city: "长沙" },
  "长沙-天心区": { lat: 28.11, lng: 112.99, province: "湖南", city: "长沙" },
  "长沙-芙蓉区": { lat: 28.20, lng: 113.00, province: "湖南", city: "长沙" },
  "长沙-开福区": { lat: 28.25, lng: 112.98, province: "湖南", city: "长沙" },
  "长沙-雨花区": { lat: 28.13, lng: 113.03, province: "湖南", city: "长沙" },
  "长沙-望城区": { lat: 28.21, lng: 112.82, province: "湖南", city: "长沙" },
  "长沙-长沙县": { lat: 28.25, lng: 113.08, province: "湖南", city: "长沙" },

  // ===== 福建 =====
  "福州-鼓楼区": { lat: 26.08, lng: 119.30, province: "福建", city: "福州" },
  "福州-台江区": { lat: 26.06, lng: 119.31, province: "福建", city: "福州" },
  "福州-仓山区": { lat: 26.04, lng: 119.32, province: "福建", city: "福州" },
  "福州-晋安区": { lat: 26.13, lng: 119.32, province: "福建", city: "福州" },
  "厦门-思明区": { lat: 24.48, lng: 118.08, province: "福建", city: "厦门" },
  "厦门-湖里区": { lat: 24.51, lng: 118.10, province: "福建", city: "厦门" },
  "厦门-集美区": { lat: 24.57, lng: 118.10, province: "福建", city: "厦门" },
  "厦门-海沧区": { lat: 24.49, lng: 117.99, province: "福建", city: "厦门" },
  "厦门-翔安区": { lat: 24.62, lng: 118.24, province: "福建", city: "厦门" },
  "厦门-同安区": { lat: 24.72, lng: 118.15, province: "福建", city: "厦门" },
  "泉州-丰泽区": { lat: 24.89, lng: 118.61, province: "福建", city: "泉州" },
  "泉州-鲤城区": { lat: 24.91, lng: 118.59, province: "福建", city: "泉州" },

  // ===== 山东 =====
  "济南-历下区": { lat: 36.67, lng: 117.08, province: "山东", city: "济南" },
  "济南-市中区": { lat: 36.65, lng: 117.00, province: "山东", city: "济南" },
  "济南-历城区": { lat: 36.68, lng: 117.07, province: "山东", city: "济南" },
  "济南-天桥区": { lat: 36.70, lng: 116.99, province: "山东", city: "济南" },
  "济南-槐荫区": { lat: 36.67, lng: 116.95, province: "山东", city: "济南" },
  "青岛-市南区": { lat: 36.07, lng: 120.38, province: "山东", city: "青岛" },
  "青岛-市北区": { lat: 36.09, lng: 120.38, province: "山东", city: "青岛" },
  "青岛-崂山区": { lat: 36.11, lng: 120.47, province: "山东", city: "青岛" },
  "青岛-城阳区": { lat: 36.31, lng: 120.37, province: "山东", city: "青岛" },
  "青岛-黄岛区": { lat: 35.96, lng: 120.19, province: "山东", city: "青岛" },
  "青岛-李沧区": { lat: 36.14, lng: 120.43, province: "山东", city: "青岛" },
  "烟台-芝罘区": { lat: 37.54, lng: 121.39, province: "山东", city: "烟台" },
  "潍坊-奎文区": { lat: 36.71, lng: 119.13, province: "山东", city: "潍坊" },
  "临沂-兰山区": { lat: 35.06, lng: 118.34, province: "山东", city: "临沂" },
  "淄博-张店区": { lat: 36.81, lng: 118.05, province: "山东", city: "淄博" },

  // ===== 河南 =====
  "郑州-金水区": { lat: 34.76, lng: 113.66, province: "河南", city: "郑州" },
  "郑州-二七区": { lat: 34.73, lng: 113.64, province: "河南", city: "郑州" },
  "郑州-中原区": { lat: 34.75, lng: 113.61, province: "河南", city: "郑州" },
  "郑州-管城回族区": { lat: 34.72, lng: 113.68, province: "河南", city: "郑州" },
  "郑州-惠济区": { lat: 34.80, lng: 113.62, province: "河南", city: "郑州" },
  "郑州-郑东新区": { lat: 34.77, lng: 113.72, province: "河南", city: "郑州" },
  "洛阳-西工区": { lat: 34.67, lng: 112.44, province: "河南", city: "洛阳" },
  "洛阳-涧西区": { lat: 34.66, lng: 112.39, province: "河南", city: "洛阳" },
  "开封-鼓楼区": { lat: 34.79, lng: 114.34, province: "河南", city: "开封" },

  // ===== 河北 =====
  "石家庄-长安区": { lat: 38.04, lng: 114.54, province: "河北", city: "石家庄" },
  "石家庄-桥西区": { lat: 38.01, lng: 114.46, province: "河北", city: "石家庄" },
  "石家庄-新华区": { lat: 38.05, lng: 114.47, province: "河北", city: "石家庄" },
  "石家庄-裕华区": { lat: 38.01, lng: 114.53, province: "河北", city: "石家庄" },
  "唐山-路北区": { lat: 39.63, lng: 118.21, province: "河北", city: "唐山" },
  "保定-竞秀区": { lat: 38.88, lng: 115.45, province: "河北", city: "保定" },

  // ===== 安徽 =====
  "合肥-蜀山区": { lat: 31.85, lng: 117.26, province: "安徽", city: "合肥" },
  "合肥-庐阳区": { lat: 31.88, lng: 117.26, province: "安徽", city: "合肥" },
  "合肥-包河区": { lat: 31.83, lng: 117.31, province: "安徽", city: "合肥" },
  "合肥-瑶海区": { lat: 31.86, lng: 117.31, province: "安徽", city: "合肥" },
  "合肥-高新区": { lat: 31.82, lng: 117.18, province: "安徽", city: "合肥" },
  "芜湖-镜湖区": { lat: 31.37, lng: 118.38, province: "安徽", city: "芜湖" },
  "蚌埠-蚌山区": { lat: 32.92, lng: 117.36, province: "安徽", city: "蚌埠" },

  // ===== 江西 =====
  "南昌-东湖区": { lat: 28.68, lng: 115.89, province: "江西", city: "南昌" },
  "南昌-西湖区": { lat: 28.66, lng: 115.87, province: "江西", city: "南昌" },
  "南昌-青山湖区": { lat: 28.68, lng: 115.96, province: "江西", city: "南昌" },
  "南昌-红谷滩区": { lat: 28.63, lng: 115.86, province: "江西", city: "南昌" },

  // ===== 重庆 =====
  "重庆-渝中区": { lat: 29.56, lng: 106.57, province: "重庆", city: "重庆" },
  "重庆-江北区": { lat: 29.61, lng: 106.57, province: "重庆", city: "重庆" },
  "重庆-南岸区": { lat: 29.52, lng: 106.56, province: "重庆", city: "重庆" },
  "重庆-渝北区": { lat: 29.72, lng: 106.63, province: "重庆", city: "重庆" },
  "重庆-九龙坡区": { lat: 29.50, lng: 106.51, province: "重庆", city: "重庆" },
  "重庆-沙坪坝区": { lat: 29.54, lng: 106.46, province: "重庆", city: "重庆" },
  "重庆-巴南区": { lat: 29.38, lng: 106.54, province: "重庆", city: "重庆" },
  "重庆-大渡口区": { lat: 29.48, lng: 106.48, province: "重庆", city: "重庆" },
  "重庆-北碚区": { lat: 29.83, lng: 106.44, province: "重庆", city: "重庆" },

  // ===== 陕西 =====
  "西安-碑林区": { lat: 34.26, lng: 108.94, province: "陕西", city: "西安" },
  "西安-莲湖区": { lat: 34.27, lng: 108.94, province: "陕西", city: "西安" },
  "西安-新城区": { lat: 34.27, lng: 108.96, province: "陕西", city: "西安" },
  "西安-雁塔区": { lat: 34.22, lng: 108.94, province: "陕西", city: "西安" },
  "西安-未央区": { lat: 34.30, lng: 108.94, province: "陕西", city: "西安" },
  "西安-灞桥区": { lat: 34.27, lng: 109.02, province: "陕西", city: "西安" },
  "西安-长安区": { lat: 34.16, lng: 108.94, province: "陕西", city: "西安" },
  "西安-高新区": { lat: 34.23, lng: 108.88, province: "陕西", city: "西安" },

  // ===== 辽宁 =====
  "沈阳-沈河区": { lat: 41.80, lng: 123.46, province: "辽宁", city: "沈阳" },
  "沈阳-和平区": { lat: 41.79, lng: 123.42, province: "辽宁", city: "沈阳" },
  "沈阳-铁西区": { lat: 41.80, lng: 123.37, province: "辽宁", city: "沈阳" },
  "沈阳-皇姑区": { lat: 41.82, lng: 123.42, province: "辽宁", city: "沈阳" },
  "沈阳-大东区": { lat: 41.81, lng: 123.47, province: "辽宁", city: "沈阳" },
  "沈阳-浑南区": { lat: 41.72, lng: 123.45, province: "辽宁", city: "沈阳" },
  "大连-中山区": { lat: 38.92, lng: 121.64, province: "辽宁", city: "大连" },
  "大连-西岗区": { lat: 38.92, lng: 121.61, province: "辽宁", city: "大连" },
  "大连-沙河口区": { lat: 38.91, lng: 121.59, province: "辽宁", city: "大连" },
  "大连-甘井子区": { lat: 38.95, lng: 121.57, province: "辽宁", city: "大连" },

  // ===== 吉林 =====
  "长春-南关区": { lat: 43.86, lng: 125.35, province: "吉林", city: "长春" },
  "长春-朝阳区": { lat: 43.87, lng: 125.32, province: "吉林", city: "长春" },
  "长春-宽城区": { lat: 43.91, lng: 125.33, province: "吉林", city: "长春" },
  "长春-二道区": { lat: 43.87, lng: 125.38, province: "吉林", city: "长春" },
  "长春-绿园区": { lat: 43.88, lng: 125.26, province: "吉林", city: "长春" },

  // ===== 黑龙江 =====
  "哈尔滨-道里区": { lat: 45.76, lng: 126.62, province: "黑龙江", city: "哈尔滨" },
  "哈尔滨-南岗区": { lat: 45.76, lng: 126.67, province: "黑龙江", city: "哈尔滨" },
  "哈尔滨-道外区": { lat: 45.79, lng: 126.65, province: "黑龙江", city: "哈尔滨" },
  "哈尔滨-香坊区": { lat: 45.72, lng: 126.68, province: "黑龙江", city: "哈尔滨" },
  "哈尔滨-松北区": { lat: 45.80, lng: 126.56, province: "黑龙江", city: "哈尔滨" },

  // ===== 云南 =====
  "昆明-五华区": { lat: 25.04, lng: 102.73, province: "云南", city: "昆明" },
  "昆明-盘龙区": { lat: 25.07, lng: 102.76, province: "云南", city: "昆明" },
  "昆明-官渡区": { lat: 25.02, lng: 102.75, province: "云南", city: "昆明" },
  "昆明-西山区": { lat: 25.03, lng: 102.67, province: "云南", city: "昆明" },
  "昆明-呈贡区": { lat: 24.89, lng: 102.82, province: "云南", city: "昆明" },

  // ===== 贵州 =====
  "贵阳-南明区": { lat: 26.57, lng: 106.71, province: "贵州", city: "贵阳" },
  "贵阳-云岩区": { lat: 26.60, lng: 106.72, province: "贵州", city: "贵阳" },
  "贵阳-观山湖区": { lat: 26.65, lng: 106.62, province: "贵州", city: "贵阳" },
  "贵阳-花溪区": { lat: 26.43, lng: 106.67, province: "贵州", city: "贵阳" },

  // ===== 广西 =====
  "南宁-青秀区": { lat: 22.82, lng: 108.35, province: "广西", city: "南宁" },
  "南宁-兴宁区": { lat: 22.85, lng: 108.37, province: "广西", city: "南宁" },
  "南宁-西乡塘区": { lat: 22.84, lng: 108.31, province: "广西", city: "南宁" },
  "南宁-江南区": { lat: 22.79, lng: 108.31, province: "广西", city: "南宁" },
  "南宁-良庆区": { lat: 22.76, lng: 108.32, province: "广西", city: "南宁" },

  // ===== 山西 =====
  "太原-迎泽区": { lat: 37.87, lng: 112.56, province: "山西", city: "太原" },
  "太原-杏花岭区": { lat: 37.89, lng: 112.56, province: "山西", city: "太原" },
  "太原-万柏林区": { lat: 37.86, lng: 112.52, province: "山西", city: "太原" },
  "太原-小店区": { lat: 37.82, lng: 112.56, province: "山西", city: "太原" },
  "太原-尖草坪区": { lat: 37.91, lng: 112.52, province: "山西", city: "太原" },

  // ===== 甘肃 =====
  "兰州-城关区": { lat: 36.06, lng: 103.83, province: "甘肃", city: "兰州" },
  "兰州-七里河区": { lat: 36.07, lng: 103.79, province: "甘肃", city: "兰州" },
  "兰州-安宁区": { lat: 36.10, lng: 103.72, province: "甘肃", city: "兰州" },
  "兰州-西固区": { lat: 36.09, lng: 103.63, province: "甘肃", city: "兰州" },

  // ===== 海南 =====
  "海口-龙华区": { lat: 20.03, lng: 110.35, province: "海南", city: "海口" },
  "海口-美兰区": { lat: 20.05, lng: 110.37, province: "海南", city: "海口" },
  "海口-琼山区": { lat: 20.01, lng: 110.35, province: "海南", city: "海口" },
  "海口-秀英区": { lat: 20.01, lng: 110.29, province: "海南", city: "海口" },
  "三亚-吉阳区": { lat: 18.25, lng: 109.51, province: "海南", city: "三亚" },
  "三亚-天涯区": { lat: 18.25, lng: 109.45, province: "海南", city: "三亚" },
  "三亚-海棠区": { lat: 18.31, lng: 109.72, province: "海南", city: "三亚" },

  // ===== 内蒙古 =====
  "呼和浩特-赛罕区": { lat: 40.79, lng: 111.71, province: "内蒙古", city: "呼和浩特" },
  "呼和浩特-新城区": { lat: 40.83, lng: 111.67, province: "内蒙古", city: "呼和浩特" },
  "呼和浩特-回民区": { lat: 40.81, lng: 111.62, province: "内蒙古", city: "呼和浩特" },
  "呼和浩特-玉泉区": { lat: 40.79, lng: 111.67, province: "内蒙古", city: "呼和浩特" },

  // ===== 宁夏 =====
  "银川-兴庆区": { lat: 38.47, lng: 106.28, province: "宁夏", city: "银川" },
  "银川-金凤区": { lat: 38.47, lng: 106.24, province: "宁夏", city: "银川" },
  "银川-西夏区": { lat: 38.50, lng: 106.16, province: "宁夏", city: "银川" },

  // ===== 青海 =====
  "西宁-城中区": { lat: 36.62, lng: 101.77, province: "青海", city: "西宁" },
  "西宁-城东区": { lat: 36.61, lng: 101.80, province: "青海", city: "西宁" },
  "西宁-城西区": { lat: 36.63, lng: 101.76, province: "青海", city: "西宁" },
  "西宁-城北区": { lat: 36.65, lng: 101.76, province: "青海", city: "西宁" },

  // ===== 新疆 =====
  "乌鲁木齐-天山区": { lat: 43.79, lng: 87.63, province: "新疆", city: "乌鲁木齐" },
  "乌鲁木齐-沙依巴克区": { lat: 43.78, lng: 87.57, province: "新疆", city: "乌鲁木齐" },
  "乌鲁木齐-新市区": { lat: 43.84, lng: 87.57, province: "新疆", city: "乌鲁木齐" },
  "乌鲁木齐-水磨沟区": { lat: 43.83, lng: 87.64, province: "新疆", city: "乌鲁木齐" },

  // ===== 西藏 =====
  "拉萨-城关区": { lat: 29.65, lng: 91.14, province: "西藏", city: "拉萨" },
  "拉萨-堆龙德庆区": { lat: 29.65, lng: 90.99, province: "西藏", city: "拉萨" },

  // ===== 台湾 =====
  "台北-中正区": { lat: 25.03, lng: 121.52, province: "台湾", city: "台北" },
  "台北-大安区": { lat: 25.03, lng: 121.54, province: "台湾", city: "台北" },
  "台北-信义区": { lat: 25.03, lng: 121.57, province: "台湾", city: "台北" },
  "台北-松山区": { lat: 25.06, lng: 121.56, province: "台湾", city: "台北" },
  "高雄-前镇区": { lat: 22.61, lng: 120.31, province: "台湾", city: "高雄" },
  "台中-西区": { lat: 24.15, lng: 120.67, province: "台湾", city: "台中" },

  // ===== 港澳 =====
  "香港-中西区": { lat: 22.29, lng: 114.15, province: "香港", city: "香港" },
  "香港-湾仔区": { lat: 22.28, lng: 114.17, province: "香港", city: "香港" },
  "香港-东区": { lat: 22.28, lng: 114.22, province: "香港", city: "香港" },
  "香港-九龙城区": { lat: 22.31, lng: 114.19, province: "香港", city: "香港" },
  "香港-观塘区": { lat: 22.31, lng: 114.23, province: "香港", city: "香港" },
  "香港-屯门区": { lat: 22.39, lng: 113.97, province: "香港", city: "香港" },
  "澳门-花地玛堂区": { lat: 22.21, lng: 113.55, province: "澳门", city: "澳门" },
  "澳门-大堂区": { lat: 22.20, lng: 113.54, province: "澳门", city: "澳门" },
};

// 获取所有省份
export function getProvinces(): string[] {
  const provinces = new Set<string>();
  for (const loc of Object.values(LOCATION_DB)) {
    provinces.add(loc.province);
  }
  return [...provinces].sort();
}

// 获取省份下的城市
export function getCities(province: string): string[] {
  const cities = new Set<string>();
  for (const loc of Object.values(LOCATION_DB)) {
    if (loc.province === province) {
      cities.add(loc.city);
    }
  }
  return [...cities].sort();
}

// 获取城市下的区县
export function getDistricts(city: string): string[] {
  const districts: string[] = [];
  for (const [key, loc] of Object.entries(LOCATION_DB)) {
    if (loc.city === city) {
      const parts = key.split("-");
      districts.push(parts[1] ?? key);
    }
  }
  return districts.sort();
}

// 搜索地点
export function searchLocations(keyword: string): Array<{ key: string; lat: number; lng: number }> {
  const results: Array<{ key: string; lat: number; lng: number }> = [];
  for (const [key, loc] of Object.entries(LOCATION_DB)) {
    if (key.includes(keyword) || loc.province.includes(keyword) || loc.city.includes(keyword)) {
      results.push({ key, lat: loc.lat, lng: loc.lng });
    }
  }
  return results.slice(0, 20);
}

// 兼容旧接口
export const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {};
for (const [key, loc] of Object.entries(LOCATION_DB)) {
  CITY_COORDINATES[key] = { lat: loc.lat, lng: loc.lng };
}
// 也添加城市级别
for (const [key, loc] of Object.entries(LOCATION_DB)) {
  if (!CITY_COORDINATES[loc.city]) {
    CITY_COORDINATES[loc.city] = { lat: loc.lat, lng: loc.lng };
  }
}
