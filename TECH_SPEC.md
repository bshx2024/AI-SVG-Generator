# AI-SVG-Generator 技术架构与核心算法规范 (Tech Spec)

## 一、 系统总体架构：双轨制流水线 (Dual-Track Architecture)

由于前端开发者需求与物理切割（Cricut/激光雕刻/POD）需求在底层几何拓扑上存在根本冲突，系统采用**严格解耦的双轨引擎架构**：

```
                                  ┌── 用户输入 (Prompt / Image) ──┐
                                  │                               │
                                  ▼                               ▼
                     【轨道 A：开发者 UI/动效引擎】     【轨道 B：物理级切刻/POD 引擎】
                                  │                               │
                        GPT-6.2 Astra 原生直出        高对比度 Diffusion 生图 / 用户位图
                                  │                               │
                            语义化 XML 生成             Step 1: 图像预处理 (去抗锯齿/硬化)
                                  │                               │
                         SVGO 压缩与属性抽取            Step 2: 轮廓追踪与矢量化 (VTracer)
                                  │                               │
                      代码转换 (JSX/Vue/Tailwind)       Step 3: 几何拓扑清洗 (ClipperLib)
                                  │                               │
                                  │                     Step 4: 补漏白算法 (Trapping/Choke)
                                  │                               │
                                  │                     Step 5: 分色复合路径打组 (Compound Path)
                                  │                               │
                                  ▼                               ▼
                          [极简前端代码组件]               [100% Cut-Ready 物理级 SVG]
```

---

## 二、 物理切刻引擎（轨道 B）核心算法规范

### 1. 边缘硬化与色彩量化（Anti-Aliasing Elimination）
* **痛点**：扩散模型（Diffusion）生成的图像自带半透明渐变抗锯齿像素，传统矢量化算法会沿着半透明过渡带描摹出成百上千个细碎杂色路径。
* **算法管道**：
  1. **色彩空间转换**：转至 CIELAB 空间计算感知色差（$\Delta E$）；
  2. **K-Means 色彩聚类**：将图像色彩强制量化压缩至 $K$ 种硬色（通常 $K \in [2, 8]$）；
  3. **自适应大津法（Otsu Thresholding）**：生成二值化硬边缘 Mask，消除所有透明度通道（Alpha 强制二值化为 0 或 255）。

### 2. 节点精简算法（RDP / Bézier Curve Fitting）
* **痛点**：传统 Trace 算法生成的路径存在“节点面条（Node Soup）”，卡死 Cricut Design Space 且使切纸刀反复震颤。
* **算法管道**：
  * 使用 **Ramer-Douglas-Peucker (RDP)** 算法对初级多边形链条进行降采样，数学模型为：
    $$\text{Distance}(P_i, \overline{P_{\text{start}}P_{\text{end}}}) \le \epsilon$$
  * 暴露前端参数 $\epsilon$（Tolerance）作为**“节点精简度滑块（Smoothness Slider）”**，允许用户在“保留极微小细节”与“极简低节点”之间动态平滑调节；
  * 使用最小二乘法进行三次贝塞尔曲线（Cubic Bézier）拟合，用最少的控制点替换直线折线。

### 3. 几何拓扑物理清洗（ClipperLib 管道）
物理切割工具（激光/刀头）必须执行物理刀具轨迹（Toolpath），输入路径必须满足严格的流形条件：
* **强制闭合（Closed Paths）**：所有多边形回路结尾必须追加 `Z` 指令；
* **自相交消除（Self-Intersection Elimination）**：使用 ClipperLib 的布尔运算（Vatti Clipping Algorithm）执行 `Union(Subject)` 操作，将自相交的小回环（Self-loops）融合成单一流形多边形；
* **退化几何过滤（Degenerate Geometry Pruning）**：自动移除周长小于设定阈值（如 $<0.5\text{mm}$）的细碎噪点孤岛与空路径。

### 4. 物理印花补漏白/陷印算法（Vector Trapping / Choking）
* **痛点**：若相邻图层完全无缝贴合，在物理热转印、贴纸粘贴或材料收缩时，接缝处必然出现露白缝隙。
* **算法管道**：
  1. 识别两两相邻接触的不同颜色路径 $P_A$ 与 $P_B$；
  2. 使用 ClipperLib 的 `Offset(delta = +0.2mm ~ +0.5mm)` 对上层路径执行向外膨胀扩张；
  3. 通过布尔与操作（Intersection），让底层多边形适度重叠覆盖于边界之下，彻底杜绝物理形变引起的接缝露白。

### 5. Cricut 专属消毒与分色复合路径构建（Compound Pathing）
* **属性平铺化**：将所有 CSS 规则（`<style>`、class 类名）完全内联为行内属性（如 `fill="#000000"`）；
* **危险标签清洗**：强制剔除 `<script>`、`<style>`、`@keyframes`、`<clipPath>` 等 Cricut 无法识别或会导致崩溃的标签；
* **分色复合路径合并**：同一颜色值的所有分离路径，必须通过布尔并集计算融合成一个单一的**复合路径（Compound Path）**，并在 SVG 结构中打包为带有友好标识的图层组：
  ```xml
  <!-- 标准 Cricut-Ready 分色结构 -->
  <g id="Layer-1-Black" fill="#1A1A1A">
    <path d="M...Z M...Z" fill-rule="evenodd"/>
  </g>
  <g id="Layer-2-Red" fill="#E53935">
    <path d="M...Z M...Z" fill-rule="evenodd"/>
  </g>
  ```

---

## 三、 开发者 UI 引擎（轨道 A）规范

面向前端/UI 设计师群体，系统调用大语言模型（GPT-6.2 Astra）直接直出语义化代码：

* **系统提示词规范（System Prompt Constraints）**：
  * 强制指定 `viewBox="0 0 24 24"`（或 `0 0 100 100`）；
  * 统一使用 `currentColor` 作为默认 fill/stroke，便于 TailwindCSS 动态换色；
  * 禁止输出无语义的杂乱 ID，只保留 `<path>`、`<circle>`、`<rect>` 等几何图元。
* **后处理优化（SVGO Pipeline）**：
  * `removeDoctype`, `removeXMLProcInst`, `removeComments`, `cleanupIds`；
  * 格式化并提供组件包装代码：
    * **React JSX** 组件模版；
    * **Vue 3 Template** 模版；
    * **纯 SVG Code** 复制。

---

## 四、 核心技术栈与选型建议

| 模块 | 推荐技术选型 | 理由与关键指标 |
| :--- | :--- | :--- |
| **全栈框架** | Next.js (App Router) + TypeScript + TailwindCSS | SEO 友好，SSR 极速首屏，便于构建 SaaS 仪表盘与支付对接 |
| **矢量化底层 (Core Tracer)** | **VTracer (Rust)** | 开源高性能矢量化引擎，速度比 Potrace 快数倍，支持曲线拟合，可打包为 WebAssembly 或后端微服务 |
| **几何拓扑与清洗** | **pyclipper (Python) / Clipper2 (C++/WASM)** | 工业级多边形布尔裁剪库，解决自相交、Offset 补漏白与闭合路径的绝对标准 |
| **SVG 代码优化** | **SVGO (Node.js)** | 业界事实标准，彻底精简无用标签与元数据 |
| **生图模型 (Track B)** | **Flux / SDXL (配高对比黑白线稿 LoRA)** | 生成边缘极其锐利、零灰度渐变的几何插画，大幅降低后置矢量化噪声 |
| **代码直出大模型 (Track A)** | **GPT-6.2 Astra API** | 具备极强几何拓扑与代码编写能力，适合极简图标与动效直出 |
| **计费与商业化** | Stripe / LemonSqueezy | 支持订阅制（Pro $9.9/月）与点卡消耗制（$4.99/20次）同时接入 |

