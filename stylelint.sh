git checkout -b add-stylelint
if [ -f "yarn.lock" ]; then
  yarn add -D stylelint stylelint-config-recommended
else
  npm add -D stylelint stylelint-config-recommended
fi


if [ ! -f '.stylelintrc.json' ]; then
  echo '{
    "extends": "stylelint-config-recommended",
    "rules": {
      "no-descending-specificity": null,
      "declaration-colon-newline-after": null,
      "at-rule-no-unknown": null
    }
  }' > .stylelintrc.json
fi

lintTest=$(echo '.foo {}' | npx stylelint)

if [ ! -z lintTest ]; then
  echo '测试 Lint 成功!'
fi

filterLint=$(code --list-extensions | grep 'stylelint.vscode-stylelint')

if [ -z filterLint ]; then
  echo 正在安装 vscode—stylelint 插件
  code --install-extension stylelint.vscode-stylelint
fi

git add .
git commit -m 'ci: 添加 stylelint!'

echo '"*.{css,scss,less,pcss}": [
      "stylelint"
    ]' | pbcopy
echo lint-stages 配置复制成功，请自行添加到 package.json 中
