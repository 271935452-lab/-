/** 地址库「等时次数」：绑定运单添加销售/渠道费用 W15·待时费 → 该地址 +1/票 */
window.ADDR_WAIT_FEE = { code: "W15", name: "待时费" };
window.waybillHasWaitFee = function (w) {
  if (!w) return false;
  if (w.hasWaitFee === true) return true;
  var fees = w.fees || w.feeLines || [];
  for (var i = 0; i < fees.length; i++) {
    var f = fees[i] || {};
    var c = String(f.code || f.feeCode || "").toUpperCase();
    var n = f.name || f.feeName || "";
    if (c === "W15" || n === "待时费") return true;
  }
  return false;
};

window.ADDR_LIB_DEMO_ROWS = [
      {
        id: "ADDR-1008", key: "US|CA|Los Angeles|123 Main St|90058",
        show: "123 Main St, Los Angeles, CA 90058", state: "CA",
        aliases: ["123 Main Street", "Main St #123 LA 90058", "洛杉矶主街123号仓"],
        l1: "商业有卸货台", l2: "仓库 / 物流园有卸货台", purpose: "仓储卸货",
        st: "done", n: 6, at: "2026-09-18",
        maxTruck: "53尺", tail: 2, wait: 2, avgDays: 9.5, window: "周一至周五 08:00-16:00",
        cust: ["无特殊"],
        dists: [
          { origin: "洛杉矶仓", product: "中美快运私人卡派(洛杉矶)", miles: 22, by: "报价员·核实" },
          { origin: "奥克兰仓", product: "中美快运私人卡派(奥克兰)", miles: 380, by: "报价员·核实" }
        ],
        photos: [
          { cat: "签收外景照", name: "LA_123Main_pod_ext.jpg", by: "港后·陈静", at: "2026-09-19" },
          { cat: "签收外景视频", name: "LA_123Main_pod.mp4", by: "港后·陈静", at: "2026-09-19" }
        ],
        tickets: [
          {
            no: "CUS-202608-221", by: "港后·陈静", at: "2026-09-19", src: "both",
            out: { l1: "商业有卸货台", l2: "仓库 / 物流园有卸货台", truck: "53尺", tail: "是", window: "周一至周五 08:00-16:00" },
            pod: { cust: ["无特殊"], wait: "否", photos: "外景已传" }
          },
          {
            no: "CUS-202607-088", by: "港后·李婷", at: "2026-07-22", src: "both",
            out: { l1: "商业有卸货台", truck: "53尺", tail: "是" },
            pod: { cust: ["无特殊"], waitFee: { code: "W15", name: "待时费", amt: "USD 85" }, photos: "外景已传" }
          },
          {
            no: "CUS-202606-041", by: "港后·王芳", at: "2026-06-18", src: "both",
            out: { l1: "商业有卸货台", truck: "26尺", tail: "否" },
            pod: { cust: ["需预约"], wait: "否", photos: "门头+外景" }
          },
          {
            no: "CUS-202605-019", by: "港后·陈静", at: "2026-05-09", src: "out",
            out: { l1: "商业有卸货台", truck: "53尺", tail: "是" },
            pod: null
          },
          {
            no: "CUS-202604-007", by: "港后·李婷", at: "2026-04-12", src: "both",
            out: { l1: "商业有卸货台", truck: "53尺", tail: "是" },
            pod: { cust: ["无特殊"], waitFee: { code: "W15", name: "待时费", amt: "USD 60" }, photos: "—" }
          }
        ]
      },
      {
        id: "ADDR-1012", key: "US|NJ|Edison|88 Oak Ave|08817",
        show: "88 Oak Ave, Edison, NJ 08817", state: "NJ",
        aliases: ["88 Oak Avenue", "Oak Ave 88 Edison"],
        l1: "住宅", l2: "独立屋 / 单户", purpose: "私人住宅收货",
        st: "oversea", n: 3, at: "报价已核实 2026-10-06",
        maxTruck: "26尺", tail: 3, wait: 0, avgDays: "—", window: "需预约晚上",
        cust: [],
        dists: [{ origin: "纽约仓", product: "中美快运私人卡派(纽约)", miles: 28, by: "报价员·核实" }],
        photos: [],
        tickets: [
          {
            no: "CUS-202609-014", by: "报价员·核实", at: "2026-10-06", src: "quote",
            out: { l1: "住宅", l2: "独立屋 / 单户", truck: "26尺" },
            pod: null, note: "待出发/签收补全"
          }
        ]
      },
      {
        id: "ADDR-1019", key: "US|TX|Houston|500 Warehouse Rd|77032",
        show: "500 Warehouse Rd, Houston, TX 77032", state: "TX",
        l1: "—", l2: "—", purpose: "—",
        st: "quote", n: 0, at: "—",
        maxTruck: "—", tail: 0, wait: 0, avgDays: "—", window: "—",
        cust: [], dists: [], photos: [], tickets: []
      },
      {
        id: "ADDR-1024", key: "US|CA|Irvine|2100 Barranca Pkwy|92606",
        show: "2100 Barranca Pkwy, Irvine, CA 92606", state: "CA",
        aliases: ["2100 Barranca Parkway", "Barranca Pkwy 2100"],
        l1: "商业无卸货台", l2: "临街商铺", purpose: "零售门店收货",
        st: "done", n: 4, at: "2026-09-28",
        maxTruck: "26尺", tail: 1, wait: 0, avgDays: 8.0, window: "工作日 09:00-17:00",
        cust: ["需预约"],
        dists: [{ origin: "洛杉矶仓", product: "中美快运私人卡派(洛杉矶)", miles: 35, by: "报价员·核实" }],
        photos: [
          { cat: "签收外景照", name: "Irvine_pod_ext.jpg", by: "港后·王芳", at: "2026-09-29" }
        ],
        tickets: [
          {
            no: "CUS-202609-201", by: "港后·王芳", at: "2026-09-29", src: "both",
            out: { l1: "商业无卸货台", l2: "临街商铺", truck: "26尺", tail: "否", window: "工作日 09:00-17:00" },
            pod: { cust: ["需预约"], wait: "否", photos: "外景已传" }
          }
        ]
      },
      {
        id: "ADDR-1031", key: "US|NY|Brooklyn|45 Flatbush Ave|11217",
        show: "45 Flatbush Ave, Brooklyn, NY 11217", state: "NY",
        l1: "住宅", l2: "公寓 / 多层", purpose: "住户单元收货",
        st: "oversea", n: 1, at: "报价已核实 2026-10-05",
        maxTruck: "26尺", tail: 1, wait: 0, avgDays: "—", window: "需预约",
        cust: [],
        dists: [],
        photos: [],
        tickets: []
      }
    ];
