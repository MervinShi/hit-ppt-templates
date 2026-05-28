import React from "react";
import { FileText, Image, Save, Sparkles, Type } from "lucide-react";

const sampleMarkdown = `# 汇报标题
副标题：汇报人 / 单位 / 日期
这里填写封面说明或汇报人信息。
![封面图](hit-shenzhen/hit-building.png)

---

# 研究背景
副标题：问题定义与关键挑战
城市路网传感器、视频检测器与轨迹数据存在采样频率、空间覆盖和噪声模式差异。
- 数据缺失与异常值影响模型稳定性
- 高峰时段误差显著上升
- 需要跨源融合提升预测可信度

---

# 实验数据
副标题：指标与对比结果
指标：12.8%｜MAE 下降
指标：18.4%｜RMSE 下降
指标：0.91｜置信覆盖率

---

# 图文展示
副标题：图片、截图或活动照片
这里填写图片说明和结论。
![示例图片](hit-shenzhen/campus-mark.jpg)

---

# 谢谢
欢迎批评指正`;

export function EditorPanel({ deck, currentSlide, currentBlock, selectedBlockId, setSelectedBlockId, updateBlock, updateTheme, onGenerate }) {
  const slide = deck.slides[currentSlide];
  const [source, setSource] = React.useState(sampleMarkdown);

  function updateContent(value, field) {
    if (!currentBlock) return;
    if (currentBlock.type === "metric") {
      updateBlock(currentBlock.id, { content: { ...currentBlock.content, [field]: value } });
      return;
    }
    updateBlock(currentBlock.id, { content: value });
  }

  return (
    <aside className="editor-panel">
      <div className="panel-section">
        <h2>动态编辑</h2>
        <p>选择画布元素后可修改内容、替换素材、拖拽移动，并通过右下角控制点调整尺寸。</p>
      </div>

      <div className="panel-section generator-section">
        <h2>自动生成</h2>
        <p>用 `---` 分页，支持标题、正文、列表、图片、指标和表格。图片请放入 `public/assets/`，路径写为 `hit-shenzhen/campus-mark.jpg` 或 `./assets/...`。</p>
        <textarea
          className="generator-input"
          value={source}
          rows={10}
          onChange={(event) => setSource(event.target.value)}
        />
        <button className="primary-button generator-button" onClick={() => onGenerate(source)}>
          <Sparkles size={16} />
          按当前模板自动排版
        </button>
        <p className="empty-tip"><FileText size={13} /> 生成后仍可逐页拖拽和编辑。</p>
      </div>

      <div className="panel-section">
        <label className="field-label">主题强调色</label>
        <div className="color-row">
          {["#005375", "#58d7ff", "#A72126", "#f5c66b", "#ff7a3d"].map((color) => (
            <button
              key={color}
              className="color-swatch"
              style={{ background: color }}
              onClick={() => updateTheme(color)}
              aria-label={`切换主题色 ${color}`}
            />
          ))}
          <input type="color" value={deck.theme.accent} onChange={(event) => updateTheme(event.target.value)} />
        </div>
      </div>

      <div className="panel-section">
        <label className="field-label">当前页元素</label>
        <div className="block-list">
          {slide.blocks.map((block) => (
            <button
              key={block.id}
              className={selectedBlockId === block.id ? "is-active" : ""}
              onClick={() => setSelectedBlockId(block.id)}
            >
              {block.type === "image" ? <Image size={15} /> : <Type size={15} />}
              <span>{block.id}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="panel-section">
        <label className="field-label">内容编辑</label>
        {!currentBlock && <p className="empty-tip">请先点击画布中的文字、图片或数据块。</p>}
        {currentBlock?.type === "text" && (
          <textarea
            value={currentBlock.content}
            rows={7}
            onChange={(event) => updateContent(event.target.value)}
          />
        )}
        {currentBlock?.type === "image" && (
          <>
            <input
              value={currentBlock.content}
              onChange={(event) => updateContent(event.target.value)}
              placeholder="/assets/your-image.png"
            />
            <p className="empty-tip">把用户素材放入 `public/assets/` 后，在这里填写路径即可。</p>
          </>
        )}
        {currentBlock?.type === "metric" && (
          <>
            <input value={currentBlock.content.value} onChange={(event) => updateContent(event.target.value, "value")} />
            <input value={currentBlock.content.label} onChange={(event) => updateContent(event.target.value, "label")} />
          </>
        )}
        {currentBlock?.type === "timeline" && (
          <textarea
            value={currentBlock.content.join("\n")}
            rows={7}
            onChange={(event) => updateBlock(currentBlock.id, { content: event.target.value.split("\n").filter(Boolean) })}
          />
        )}
      </div>

      <div className="panel-section">
        <button className="primary-button save-note">
          <Save size={16} />
          修改已自动保存在浏览器本地
        </button>
      </div>
    </aside>
  );
}
