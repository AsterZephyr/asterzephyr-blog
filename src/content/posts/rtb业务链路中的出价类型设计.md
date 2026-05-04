---
title: "RTB业务链路中的出价类型设计"
date: 2025-08-15
tags: [广告, 开发, 思考]
category: "技术分享"
---

## 概述

RTB模型服务器支持多种出价类型，包括CPM、CPC、OCPC、OCPM，每种出价类型都有对应的计算逻辑和调价因子。系统通过预算控制、成本控制、调价因子等多重机制来优化广告投放效果。

## 出价类型与计算逻辑

### 1. CPM出价 (Cost Per Mille)

**定义**: 按千次展示付费

**计算逻辑**:

- 直接使用策略设置的基础价格
- 不涉及CTR/CVR预测
- 适用于品牌广告和展示类广告

### 2. CPC出价 (Cost Per Click)

**定义**: 按点击付费，但需要转换为CPM出价

**计算逻辑**:

根据媒体出价类型区分处理：

**媒体要求CPM出价时**:

1. 获取调价因子k
2. 应用调价因子计算eCPM

**媒体支持CPC出价时**:

1. 直接返回CPC价格
2. 不应用调价因子

**核心公式**:

- **CPM转换公式**: `eCPM = CPC出价 × pCTR × 1000 × 调价因子k`
- **CPC转换公式**: `CPC = eCPM / 1000 / pCTR`

### 3. OCPC出价 (Optimized Cost Per Click)

**定义**: 优化点击付费，基于转化目标优化

**计算逻辑**:

- 同时返回CPM/CPC价格和转化成本限制
- 基于CTR预测进行优化
- 根据媒体出价类型选择对应的价格计算方式

### 4. OCPM出价 (Optimized Cost Per Mille)

**定义**: 优化千次展示付费，基于转化目标优化

**计算逻辑**:

- 基于CTR和CVR预测进行优化
- 返回转化成本限制
- 适用于转化类广告

### 5. 出价类型选择流程

[](https://bluefocus.feishu.cn/space/api/box/stream/download/asynccode/?code=YjU3ZGFhNDgzMGEwZGQ0NDc3NjBjOTgxZTdiZDdhNzNfWnNidjYweWZNdDBFRlBJN0JLSHo2b1paNjNLUDVpMnFfVG9rZW46UTMzQWIwd3A3b2hVdTN4VHRoN2NiNHEzbjdmXzE3NTc2OTg2MTQ6MTc1NzcwMjIxNF9WNA)

## 调价因子系统

### 1. CPC调价因子 (repricing_k)

**作用**: 动态调整CPC出价，确保实际成本控制在目标范围内

**计算流程图**:

[](https://bluefocus.feishu.cn/space/api/box/stream/download/asynccode/?code=MmQ1MDdlNGY4ZmRjZGMwMGEzZWY0N2E5ODAxNTM1NWJfVGhLV1ZSZWdEeWo5Mlh5UEEzQzhGYWlwNGNLRUU3cGdfVG9rZW46WWpSdmJ2MFJTb0ppVFN4Y1B4NmNRZUo4bjhkXzE3NTc2OTg2MTQ6MTc1NzcwMjIxNF9WNA)

**计算逻辑**:

1. **数据置信度检查**: 点击量是否达到阈值
2. **实际CPC计算**: `RCPC = 当天消耗 / 当天点击`
3. **误差比例计算**: `error = RCPC / TCPC`
4. **调价因子计算**:
    1. 当 `0.8 < error < 2.0` 时：`k = 1.0`（不调价）
    2. 其他情况：`k = 1.0 / error`（反向调价）
5. **范围限制**: 限制k值在 [0.1, 3.0] 范围内

**调价因子含义**:

- `k = 1.0`: 不调价，成本控制良好
- `k > 1.0`: 提高出价，实际成本低于目标
- `k < 1.0`: 降低出价，实际成本高于目标

**使用条件**:

1. 启用CPC出价调整功能
2. 策略投放模式为1
3. 有足够的点击数据（默认≥500次）
4. 数据置信度足够

### 2. 预算控制因子

**出价比率 (bidrate)**:

- **标准投放模式**: `bidrate = speedRate × 预算速度慢比例`
- **快速投放模式**: `bidrate = speedRate`

**速率控制参数 (speedRate)**:

- **预算充足时**: `speedRate = 1.0`
- **预算不足时**: `speedRate = (预算剩余比例 / 阈值)^减速因子`

## 预算控制机制

### 1. 多层级预算控制

**层级结构**:

- **Campaign层级**: 广告活动总预算控制
- **Strategy层级**: 推广组预算控制
- **Creative层级**: 创意预算控制

**控制逻辑**:

1. **分别检查**: Campaign和Strategy层级分别进行预算控制
2. **取严格值**: 两个层级都通过才允许出价
3. **特殊处理**: Strategy预算为0时，只看Campaign层级

### 2. 非线性减速算法

**核心思想**: 当预算剩余不多时，逐渐降低出价频率

**预算控制流程图**:

[](https://bluefocus.feishu.cn/space/api/box/stream/download/asynccode/?code=ODg4YWY3NTNhNDEyYjUxMWVjNTUxNmM4MmM3YWMwZjVfYWNxNzRyQlR6Vkh0clNoUTBUMGhvZjNKenBpVHBJeGlfVG9rZW46SndobmI4NGE2bzhXRXZ4OTd4aWNxenJZbnFjXzE3NTc2OTg2MTQ6MTc1NzcwMjIxNF9WNA)

**算法公式**:

- **预算剩余比例** = 剩余预算 / 总预算
- **当预算剩余比例 ≥ 阈值（默认30%）时**: 速率参数 = 1.0（正常投放）
- **当预算剩余比例 < 阈值时**: 速率参数 = (预算剩余比例 / 阈值)^减速因子

**小预算特殊处理**:

- **当剩余预算 < 小预算阈值（默认500元）时**:
    - 额外衰减 = (剩余预算 / 小预算阈值)^额外因子
    - 最终速率 = 速率参数 × 额外衰减

### 3. 频率控制

**目标**: 避免某个创意下大量集中出价

**实现机制**:

- 统计key格式: "策略ID_出价类型_分钟时间戳"
- 每分钟最大出价次数限制（默认10000次）
- 使用16个分片减少锁竞争

## CTR/CVR预测模型

### 1. 模型类型

**CTR预测**:

- 海外CTR模型
- 国内CTR模型

**CVR预测**:

- 海外CVR模型（待实现）
- 国内CVR模型（待实现）

### 2. 预测结果

**预测结果包含**:

- **CreativeId**: 创意ID
- **PreCtr**: 预估点击率（×1000000）
- **PreCvr**: 预估转化率（×1000000）
- **PreDeepCvr**: 预估深度转化率（×1000000）

### 3. 冷启动处理

**冷启动CTR机制**:

- 基于应用包名匹配历史数据
- 点击量超过阈值（默认500）才采用历史CTR
- 否则使用默认CTR（默认2%）

## 完整计算链路

### 1. 整体出价计算流程

### 2. CPC出价计算示例

**输入参数**:

- 策略CPC出价: 2.0元
- 预估CTR: 0.05 (5%)
- 调价因子k: 1.2
- 媒体要求CPM出价

**计算过程**:

1. **计算基础eCPM**: `eCPM = 2.0 × 0.05 × 1000 = 100元`
2. **应用调价因子**: `adjusted_eCPM = 100 × 1.2 = 120元`
3. **最终出价**: 120元/CPM

### 3. 预算控制示例

**输入参数**:

- 总预算: 10000元
- 已消耗: 7000元
- 剩余预算: 3000元
- 预算阈值比例: 0.3

**计算过程**:

1. **计算预算剩余比例**: `ratio = 3000 / 10000 = 0.3`
2. **判断是否开始减速**: `ratio >= 0.3`，所以速率参数 = 1.0
3. **计算竞价比率**: `bidRate = 1.0 × 0.3 = 0.3`
4. **随机决定是否出价**: 如果随机数 < 0.3 则出价，否则不出价

### 4. 调价因子计算示例

**输入参数**:

- 当天消耗: 1000元
- 当天点击: 500次
- 目标CPC: 2.0元

**计算过程**:

1. **计算实际CPC**: `RCPC = 1000 / 500 = 2.0元`
2. **计算误差比例**: `error = 2.0 / 2.0 = 1.0`
3. **判断调价因子**: `0.8 < 1.0 < 2.0`，所以 `k = 1.0`（不调价）

## 日志字段说明

### 1. 关键日志字段

**核心计算字段**:

- **repricing_k**: CPC调价因子（如1.20表示提高20%出价）
- **bidrate**: 竞价比率（如0.30表示30%概率出价）
- **cold_ctr**: 冷启动CTR（如0.020000表示2%）
- **tot_req_ad_num**: 请求创意数
- **response_num**: 响应创意数
- **tot_ad_num**: 最终出价创意数

### 2. 过滤原因代码

**过滤原因格式**: `filters=[9=16|8=47|36=5|0=0]`

- **9=16**: 预算控制过滤
- **8=47**: 频控过滤
- **36=5**: 其他过滤原因
- **0=0**: 召回创意数

### 概念区分

- mediaBidType（媒体出价类型）
    - 含义：媒体/ADX希望你“以什么单位出价”。常见：1=CPM，2=CPC。
    - 作用：决定你回给媒体的出价口径（直接 CPM 还是 CPC，再由平台自行换算 eCPM 排序）。
- mediaCostType（媒体结算方式）
    - 含义：你与媒体之间“最终怎么结算”的口径（by CPM/by CPC）。
    - 作用：用于结算与对账口径，不必等同于你给广告主的结算方式。

### 客户结算方式 vs 媒体结算方式

- 客户结算方式（广告主侧，Campaign/Strategy 的 CostType，如 CPC/CPM/OCPC/OCPM）
    - 你向广告主按什么计费、优化什么KPI（点击/转化）。
- 媒体结算方式（媒体侧，mediaCostType/by CPM 或 by CPC）
    - 你向媒体/ADX按什么计费，对账/扣费口径。

两者可以不一致：例如对广告主按 CPC 优化，但对媒体按 CPM 结算。此时需要做“口径转换”和“统一排序货币”（通常统一到 eCPM 用于排序）。

### 对 ADX 和 DSP 各自要做什么

- 对 DSP（你现在的角色）
    - 依据客户结算方式（CPC/OCPC 等）产出内部目标价；再按媒体出价类型 mediaBidType 转换成媒体需要的出价口径：
        - 媒体CPM：直接回 CPM（已做 eCPM 转换/含 K 时机在出价侧）。
        - 媒体CPC：回 CPC 单价；用于排序需同时计算 eCPM=CPC×CTR×1000（我们已在 FinPrice 中按媒体CPC转换为 eCPM 回传给 UI，用于观察）。
    - K 的应用：
        - 媒体按CPM投放路径才乘 K（我们在出价侧已把 K 作用到 eCPM→Bid）。
        - 媒体CPC直投不乘 K（FinPrice 的 eCPM 也不乘 K，保持与真实出价一致）。
    - 回传字段：
        - Bid：按媒体口径（CPM 或 CPC）。
        - FinPrice：用于展示/埋点的一致 eCPM 口径（媒体CPC时做 CPC→eCPM 转换；媒体CPM时等于 Bid）。
        - RepricingFactorK：回传给 UI 观察（不改变媒体CPC的 FinPrice 计算）。
- 对 ADX（媒体侧/交易所）
    - 统一所有 DSP 出价为 eCPM 排序（无论 DSP 回的是 CPM 还是 CPC，都需内部换算成 eCPM）。
    - 按既定拍卖机制（如二价/一价）产出成交价；再按媒体结算方式计费（by CPM 或 by CPC）。
    - 对账采用 mediaCostType 对应口径。

| 广告主出价方式 | 步骤 1：DSP 向媒体报什么价？（报价逻辑） | 步骤 2：DSP 核算媒体实际成本（公式） | 步骤 3：fin_price 计算规则（广告主扣费核心） | 步骤 4：利润率适配逻辑 | 示例（含 fin_price 计算） |
| --- | --- | --- | --- | --- | --- |
| **1. CPM 出价** | 报 “等效 CPC”（将 CPM 换算为 CPC，适配媒体报价）：`price=广告主设置的CPM出价 ÷ (pCTR × 1000)`（pCTR 保守预估） | 媒体成本 = DSP 报 CPC × 媒体统计的有效点击量（即 = 广告主 CPM× 有效点击量 ÷(pCTR×1000)） | fin_price（总成本）= 媒体成本 × (1 + 利润率)fin_price（千次曝光）= fin_price（总成本）÷ (有效点击量 ÷pCTR) | 实际点击量＜预估→ 降利润率；实际点击量＞预估→ 提利润率 | 广告主 CPM=60 元，pCTR=5%（实际 6%），C 级媒体（15%），有效点击 = 600 次：等效 CPC=60÷(5%×1000)=1.2 元媒体成本 = 1.2×600=720 元fin_price=720×1.15=828 元千次曝光 fin_price=828÷(600÷5%)=828÷12000×1000=69 元 |
| **2. CPC 出价** | 直接报 “广告主目标 CPC”（`price=广告主设置的CPC出价`，如 3 元），适配媒体 CPC 报价要求。 | 媒体成本 = DSP 报 CPC × 媒体统计的有效点击量（即 = 广告主 CPC× 有效点击量） | fin_price（总成本）= 媒体成本 × (1 + 利润率)fin_price（单次点击）= 广告主 CPC × (1 + 利润率) | 优质媒体（高转化）→ 利润率 5%-8%；低质媒体（低转化）→ 利润率 12%-15% | 广告主 CPC=3 元，A 级媒体（5%），有效点击 = 600 次：媒体成本 = 3×600=1800 元fin_price=1800×1.05=1890 元单次点击 fin_price=3×1.05=3.15 元 |
| **3. OCPC 出价** | 分阶段报 “动态 CPC”：① 积累期：`price=初始CPC`（广告主设置）② 优化期：`price=internal_acost_limit × pCVR`（pCVR 保守预估） | 媒体成本 = 动态 CPC × 媒体统计的有效点击量（积累期 = 初始 CPC× 点击量；优化期 = internal_acost_limit×pCVR× 点击量） | fin_price（总成本）= 媒体成本 × (1 + 利润率)fin_price（单次点击）= 动态 CPC × (1 + 利润率) | 转化稳定（偏差＜10%）→ 利润率 8%；转化波动（偏差 10%-20%）→ 利润率 10% | 广告主 internal_acost_limit=50 元，优化期 pCVR=10%（实际 12%），B 级媒体（8%），有效点击 = 600 次：动态 CPC=50×10%=5 元媒体成本 = 5×600=3000 元fin_price=3000×1.08=3240 元单次点击 fin_price=5×1.08=5.4 元 |
| **4. OCPM 出价** | 报 “等效 CPC”（将 OCPM 转化为 CPC，适配媒体报价）：`price=internal_acost_limit × pCVR`（pCVR 保守预估） | 媒体成本 = 等效 CPC × 媒体统计的有效点击量（即 = internal_acost_limit×pCVR× 有效点击量） | fin_price（总成本）= 媒体成本 × (1 + 利润率)fin_price（单次点击）= 等效 CPC × (1 + 利润率) | 双预估偏差＜10%→ 利润率 8%；新计划 / 低质媒体→ 利润率 12%-15% | 广告主 internal_acost_limit=30 元，pCVR=15%（实际 18%），A 级媒体（5%），有效点击 = 700 次：等效 CPC=30×15%=4.5 元媒体成本 = 4.5×700=3150 元fin_price=3150×1.05=3307.5 元单次点击 fin_price=4.5×1.05=4.725 元 |

**示例（CPM）**：

- 广告主：cost_type=CT_CPM，用户设置 CPM=60 元，media_quality_score=80 分（利润率 8%）；
- 模型：pre_ctr=5% → price=60÷(5%×1000)=1.2 元（向媒体报 CPC=1.2）；
- 媒体：有效点击量 = 600 次 → 媒体成本 = 1.2×600=720 元；
- fin_price=720×1.08=777.6 元；
- 预算消耗 = max (720,777.6)=777.6 元；
- 实际有效曝光量 = 12000 次 → 广告主实际 CPM=777.6÷(12000÷1000)=64.8 元（符合用户对 CPM 的接受预期）。
