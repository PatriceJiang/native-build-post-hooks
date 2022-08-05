
# Cocos Editor Build Plugin 

在构建后触发 bash/bat 脚本, 自动化对原生工程的修改

### 使用步骤

- 构建后自动在 native/engine/[platform] 创建文件 `hooks/after-build.bat.sample`
- 重命名脚本, 去处 `.sample` 部分
- 编辑脚本

### 使用示例

iOS 工程自动执行 `pod install`

`native/engine/ios/hooks/after-build.sh`
```bash
#!/bin/bash

cp Podfile $1
cd $1
pod install
```
