git checkout -b add-commitlint

if [ -f "yarn.lock" ]; then
  yarn add -D @commitlint/cli @commitlint/config-conventional
else
  npm add -D @commitlint/cli @commitlint/config-conventional
fi


echo "module.exports = {\n  extends: ['@commitlint/config-conventional']\n}" > commitlint.config.js

lintTest=$(echo 'foo fix' | npx commitlint)

if [ ! -z lintTest ]; then
  echo '测试 commitlint 成功!'
fi


echo '"commit-msg": "commitlint -E HUSKY_GIT_PARAMS"' | pbcopy
echo 已将配置复制到剪贴板，请自行添加到 package.json 的 husky 中
