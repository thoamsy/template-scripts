const { promisify } = require('util');
const path = require('path');
const { readFileSync, writeFile, writeFileSync, readFile } = require('fs');
const { spawn } = require('child_process');

let packageTool;
try {
  readFileSync(path.resolve(process.cwd(), './yarn.lock'));
  packageTool = 'yarn';
} catch {
  packageTool = 'npm';
}

const spawnChild = async (command, options) => {
  console.log(`${packageTool} ${options}`);
  console.log('请耐心等待，没有进度条🚗');
  const result = spawn(packageTool, options.split(' '));
  for await (const chunk of result.stdout) {
    console.log(chunk.toString('utf8'));
  }
  for await (const chunk of result.stderr) {
    console.error(chunk.toString('utf8'));
  }
};

function updatePackageJSON() {
  const packagePath = path.resolve(process.cwd(), 'package.json');
  try {
    const packageJSON = JSON.parse(
      readFileSync(packagePath, { encoding: 'utf8' }),
    );

    const lintStagedKey = 'lint-staged';
    const jsKEY = '**/*.{js,ts,vue}';
    const configList = ['pretty-quick --staged', 'eslint'];
    if (packageJSON[lintStagedKey]) {
      packageJSON[lintStagedKey][jsKEY] = configList;
    } else {
      packageJSON[lintStagedKey] = {
        [jsKEY]: configList,
      };
    }

    if (packageJSON.husky) {
      Object.assign(packageJSON.husky.hooks, {
        ...packageJSON.husky.hooks,
        'pre-commit': 'lint-staged',
      });
    } else {
      packageJSON.husky = {
        hooks: {
          'pre-commit': 'lint-staged',
        },
      };
    }

    if (packageJSON.scripts) {
      packageJSON.format = `prettier --write './src/**/*.{js,ts,vue}'`;
    }
    writeFileSync(packagePath, JSON.stringify(packageJSON, null, 2));
    console.log('写入 lint-staged 成功');
    return true;
  } catch {
    console.error('解析 package.json 失败，你的东西有点问题');
    return false;
  }
}

function writeESLint() {
  try {
    const eslintPath = path.resolve(process.cwd(), '.eslintrc.js');
    const eslintConfig = require(eslintPath);
    eslintConfig.parser = 'vue-eslint-parser';
    eslintConfig.parserOptions = {
      parser: 'babel-eslint',
      sourceType: 'module',
    };
    eslintConfig.extends = (eslintConfig.extends || []).concat([
      'vue',
      'plugin:vue/recommended',
      'prettier/recommended',
    ]);
    eslintConfig.plugins = (eslintConfig.plugins || [])
      .filter(plugin => !plugin.endsWith('html'))
      .concat('vue');

    writeFileSync(
      eslintPath,
      'module.exports = ' + JSON.stringify(eslintConfig, null, 2),
    );

    console.log('修改 eslint 配置成功 🎉');
    return true;
  } catch {
    console.error('没找到 eslint 配置');
    return false;
  }
}
function writePrettier() {
  const prettierPath = path.resolve(process.cwd(), '.prettierrc');
  writeFileSync(
    prettierPath,
    JSON.stringify(
      {
        arrowParens: 'always',
        semi: true,
        singleQuote: true,
        printWidth: 80,
        useTabs: false,
        tabWidth: 2,
        trailingComma: 'es5',
      },
      null,
      2,
    ),
  );
  console.log('写入 prettier 配置成功🎉');
  return true;
}

(async function go() {
  await spawnChild(packageTool, 'remove eslint-plugin-html');
  await spawnChild(
    packageTool,
    'add -D eslint@^6 prettier eslint-config-prettier eslint-plugin-prettier vue-eslint-parser eslint-plugin-vue@^6 husky pretty-quick',
  );

  writeESLint() && writePrettier() && updatePackageJSON();
})();
