# 简历修改逻辑重构说明

## 问题描述
原有的经历修改逻辑混乱，没有明确的数据优先级规则。

## 新的逻辑规则

### 1. 数据优先级
- **简历库（profile页面）** = 最高优先级
  - 在简历库修改内容 → 更新 `resume` 状态
  - 自动清除所有岗位版本中对应项的 `previewEdits`
  - 影响范围：所有岗位版本

- **岗位版本（preview页面）** = 仅影响当前岗位
  - 在预览页面修改内容 → 只更新当前岗位的 `previewEdits`
  - 不影响简历库 `resume`
  - 影响范围：仅当前岗位

- **AI优化（optimize页面）** = 仅影响当前岗位
  - AI优化内容 → 存储在 `rewrittenDescriptions`/`polishedDescriptions`
  - 不影响简历库 `resume`
  - 影响范围：仅当前岗位

### 2. 数据读取优先级
在预览页面显示时，按以下优先级合并数据：
```
previewEdits > resume（简历库）
```

## 代码修改

### 1. store.ts 修改

#### 新增方法
```typescript
// 仅更新岗位版本的预览编辑，不影响简历库
updateTailoredPreviewWork: (tailoredId: string, workId: string, work: Partial<WorkExperience>) => void;
updateTailoredPreviewCampus: (tailoredId: string, campusId: string, campus: Partial<WorkExperience>) => void;
updateTailoredPreviewProject: (tailoredId: string, projectId: string, project: Partial<Project>) => void;
```

#### 修改现有方法
- `updateWork()` - 更新简历库时，自动清除所有岗位版本的 previewEdits
- `updateCampus()` - 更新简历库时，自动清除所有岗位版本的 previewEdits
- `updateProject()` - 更新简历库时，自动清除所有岗位版本的 previewEdits

### 2. preview/page.tsx 修改

#### 新增数据合并函数
```typescript
const getMergedWork = (w: WorkExperience) => {
  if (!currentTailored?.previewEdits?.work?.[w.id]) return w;
  return { ...w, ...currentTailored.previewEdits.work[w.id] };
};
```

#### 修改编辑行为
所有 `EditableText` 的 `onChange` 从调用 `updateWork/updateCampus/updateProject` 改为调用 `updateTailoredPreviewWork/updateTailoredPreviewCampus/updateTailoredPreviewProject`

## 使用场景

### 场景1：在简历库修改工作经历
```
用户在 profile 页面修改某个工作经历
↓
调用 updateWork(id, data)
↓
更新 resume.work
↓
清除所有岗位版本中该工作经历的 previewEdits
↓
所有岗位版本都会显示最新的简历库内容
```

### 场景2：在预览页面修改工作经历
```
用户在 preview 页面修改某个工作经历
↓
调用 updateTailoredPreviewWork(tailoredId, workId, data)
↓
只更新当前岗位的 previewEdits.work[workId]
↓
简历库 resume.work 不受影响
↓
其他岗位版本不受影响
```

### 场景3：AI优化后在预览页面查看
```
AI优化生成 rewrittenDescriptions/polishedDescriptions
↓
预览页面显示优化后的内容
↓
用户在预览页面微调某个字段
↓
调用 updateTailoredPreviewWork
↓
previewEdits 覆盖显示
↓
简历库不受影响
```

## 数据流向图

```
简历库 (resume)
    ↓ 修改
    ├─ 更新 resume
    └─ 清除所有岗位的 previewEdits

岗位版本 (preview)
    ↓ 修改
    └─ 只更新当前岗位的 previewEdits

显示优先级：
previewEdits > resume
```

## 注意事项

1. **简历库是唯一的真实数据源**
   - 所有岗位版本的基础数据都来自简历库
   - 简历库修改会影响所有岗位版本

2. **previewEdits 是临时覆盖层**
   - 只影响当前岗位
   - 不会写回简历库
   - 可以随时被简历库的更新清除

3. **AI优化内容的处理**
   - AI优化内容存储在 rewrittenDescriptions/polishedDescriptions
   - 用户可以选择使用原文或优化版（通过 useOriginalIds）
   - 在预览页面的微调会存入 previewEdits

## 测试建议

1. 测试简历库修改是否同步到所有岗位
2. 测试预览页面修改是否只影响当前岗位
3. 测试简历库修改后，previewEdits 是否被正确清除
4. 测试数据显示优先级是否正确
