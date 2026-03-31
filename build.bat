@echo off

echo 正在构建项目...
echo.

npm install
if %errorlevel% neq 0 (
    echo 安装依赖失败， pause
    exit /b 1
)

echo 正在安装 @yao-pkg/pkg...
call npm run build
if %errorlevel% neq 1 (
    echo 构建失败， pause
    exit /b 1
)

echo.
echo 构建完成！ 文件在 dist 目录
echo.

pause
