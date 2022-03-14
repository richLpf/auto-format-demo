一个用来测试eslint共享配置的包

配置规则如下，
- 依赖于recommended包
- 增加了规则"no-console"

```
module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    "no-console": "error"
  }
}

```