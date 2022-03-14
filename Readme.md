---
theme: cyanosis
---

# 一、前端代码规范工具

## 1、前言

代码规范和质量是编码中很重要的一部分，目前有很多工具可以帮助我们处理。

在使用这些工具的过程中发现，存在一下问题：
- 功能重复
- 不同工具，相同配置冲突
- 版本迭代导致配置变更
- 工具相互组合，使用困难

这篇文章主要从工程化的角度出发，分享以下内容：
- 1、介绍各种工具的使用（Prettier、ESLint、lint-staged、commitlint、Hooks）
- 2、通过Git Hooks来自动化执行这些工具。
- 3、配置CI在代码提交阶段格式化、检测代码、检测提交信息。

学习完这篇文章你将了解：
- 1、了解如何区分这些工具、不同的配置入口
- 2、在项目中如何配置这些检测工具
- 3、如果避免每次的全量检测代码
- 4、如何规范提交代码和描述信息
- 5、学习Git Hooks知识
- 6、如何将这些工具通过Hooks自动化处理
- 7、通过CI将这些流程自动化执行

[本文代码示例参考](https://github.com/richLpf/auto-format-demo)

## 2、工具分类介绍

检测代码的工具很多，主要分为三类：

- 一类是代码格式化工具，专注代码结构美化，不处理任何有关语法的内容

    - [`Prettier`](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/29e62e3c6c514314b06e0f37aca21b3b~tplv-k3u1fbpfcp-zoom-1.image)：专注代码格式化
    - [`Stylelint`](https://stylelint.io/)：专注CSS语法格式化

- 一类是lint类，这些工具也支持处理代码格式，但重点是检测代码语法质量

    - [`ESLint`](https://cn.eslint.org/): 可以配置代码格式规则，也可以检测代码语法质量

- 一类是将不同的工具进行合成，成为一个包含子功能或者有定制功能的插件，可以避免Prettier和Lint二者在代码处理上的冲突。

    - [`eslint-config-prettier`](https://github.com/prettier/eslint-config-prettier)：ESLint检测和Prettier格式化
    - [`tslint-config-prettier`](https://github.com/alexjoverm/tslint-config-prettier)：TS检测和代码格式化
    - [`lint-staged`](https://github.com/okonet/lint-staged#readme)：仅过滤Git暂存区上的文件，可以有效避免每次提交处理所有文件。
    
**Git暂存区：执行命令git add后，要提交的代码存放的空间**

这些工具有小而精的，也有大而全的，具体使用要根据具体场景
- 写一个主题样式，肯定首选Stylelint，重点处理CSS；
- 开发一个产品，不妨使用大而全。因为项目中有很多格式需要处理，如果都用小而精的处理，会引入很多荣誉的配置。

**这些工具配置都比较相似，但尤其要注意版本的不同，导致的配置不同。**

## 3、本文环境

下文依赖的工具和环境
- 3统：mac m1
- Git版本：2.24.3
- npm版本：7.21.1
- Husky版本：7.0.4
- Nodejs版本：v16.9.0

# 二、自动化工具原理和配置

## 1、原理

**Prettier、ESLint**

两者的工作原理是将代码解析成`AST`，再通过我们写的配置，还原格式化后的代码，具体转化可以体验下https://cn.eslint.org/parser/。

**lint-staged、commitlint、husky**

- `lint-staged`是获取git add后暂存区的代码。
- `commitlint`是获取git commit的描述信息然后对格式进行规则校验。
- `husky`是将git内置的勾子函数暴露出来，便于配置

## 2、配置对比

> 下面这些自动化工具，可以不同的地方进行配置，版本也不同，看起来很复杂，其实并没有，除了注意大版本的不同，其他的配置方式都大同小异。这里我们整理下这些配置通用的部分，下面就不再分开写，只展示package.json这一种方式。

| 工具名称 | package.json关键字 | 常用配置文件 | 忽略文件 | 共享文件 | 插件 |
| --- | --- | ---|---|---|---|
| Prettier | prettier  | .prettierrc、.prettierrc.*、**json、yaml、js**  | .prettierignore  | 导出配置文件，上传npm，引用即可 | @prettier/plugin-*
|ESLint| eslintConfig |.eslintrc .eslintrc.*  **json、yaml、js**|.eslintignore| eslint-config- |[开发一个插件](https://cn.eslint.org/docs/developer-guide/working-with-plugins) |
|lint-staged| lint-staged | .lintstagedrc .lintstagedrc.*  **json、yaml**  | 对代码执行操作时，自行过滤 | - | - |
|commitlint| commitlint | commitlint.config.js、.commitlintrc.js| - | - |[配置插件](https://commitlint.js.org/#/reference-plugins)|
|husky|版本<4.x.x **husky** > 4.x.x **无**| .husky | - | - | -|

**注意：**
- [配置示例地址](https://github.com/richLpf/auto-format-demo/tree/main/config)
- package.json中关键字内容和配置文件内容一致
- 共享配置一般都是导出配置文件，上传npm，规范命名即可
- 这些工具大都还提供了编辑器集成、CLI等

# 三、代码格式美化：Prettier

## 1、初始化项目构建

新建项目，并在index.html和index.js写一些格式不规范的代码

```
mkdir front-demo
cd front-demo
npm init

touch index.html
mkdir src
touch src/index.js
```

目录结构如图：

![image-20220305094227258](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0b768a07057744e9b8984063085d3f8a~tplv-k3u1fbpfcp-zoom-1.image)

## 2、插件使用

安装Prettier插件

```
yarn add prettier -D
```

执行命令：

```
yarn prettier -w .
```

发现当前所有目录下的文件，都进行了格式化

**这里使用yarn prettier是为了读取项目下的prettier指令，如果你安装全局命令或者配置了环境变量，可以不用yarn指令**

`prettier`格式有一套默认的格式化规则，一般情况下，选择默认就可以了

> 当然也可以自行配置，下面有两种配置方法：
> - 在package.json中添加关键词`prettier`
> - 在项目根目录下新建`.prettierrc`文件，js、json、yaml等也可以。
> - 下面就不再写package.json中配置了，具体关键字可以查看上面的表格。我们统一通过配置文件进行配置，其他的工具也是一样的。
> - 规则解释见配置文件[Github地址](https://github.com/richLpf/auto-format-demo/tree/main/config)

这里在根目录下新建文件`.prettierrc`

```
{
  "singleQuote": true,
  "printWidth": 120,
  "arrowParens": "avoid",
  "trailingComma": "none"
}
```
此时Prettier根据`.prettierrc`定义的规则，对整个项目做了格式化操作。
但一些场景下需要我们对个别文件进行处理，可以通过覆盖配置来实现

## 3、覆盖配置

修改`.prettierrc`文件，添加`overrides`字段

```
{
  "semi": false,
  "overrides": [
    {
      "files": "*.test.js",
      "options": {
        "semi": true
      }
    },
    {
      "files": ["*.html", "legacy/**/*.js"],
      "options": {
        "tabWidth": 4
      }
    }
  ]
}
```
这样针对`test.js`文件、`html`文件和`legacy/**/*.js`的格式就会按当前配置走。

## 4、共享配置

项目的配置一般都不会变化，所以常常多个项目使用同一个配置，特别是针对大点的项目。

下面我们实践下创建一份Prettier配置到npm仓库

1、[注册npm账号](https://www.npmjs.com/)

2、创建一个包、包的命名规则：`@prettier/plugin-` or `prettier-plugin-` or `@<scope>/prettier-plugin-`
```
cd ./config/prettier/prettier-plugin-frontdemo
npm init
mkdir .prettierrc
yarn add -D prettier
echo "/node_modules" > .gitignore
```

3、发布创建好的包
```
# 如果第一次发布需要创建
npm adduser

# 如果不是第一次发布，只需要登陆
npm login

# 发布
npm publish
```

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c5f4ee498b2a49c190fa91678594dd0a~tplv-k3u1fbpfcp-watermark.image?)

4、登陆npm官网，即可看到上传的包`prettier-plugin-frontdemo`

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/bd21ca69c70846ccae471eb8a481aa45~tplv-k3u1fbpfcp-watermark.image?)


5、使用包，在`package.json`中，添加远程仓库地址：

```
{
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "prettier": "prettier -w src/*.js",
  },
  "name": "front-demo",
  "prettier": "prettier-plugin-frontdemo"
}
```

6、执行`yarn prettier`

## 5、忽略文件

如果想要忽略某个文件的格式化，可以新建文件`.prettierignore`，添加要忽略的文件

```
/dist
*.html
```

# 四、代码质量检测：ESLint

## 1、安装ESLint插件

`yarn add eslint -D`

## 2、新建配置文件

`yarn add eslint --init`

上述命令行会弹出选择提示，根据需要选择eslint规则，最后会在根目录下生成`.eslintrc.js`文件

```
module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended"
    ],
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true
        },
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "plugins": [
        "react"
    ],
    "rules": {
        "quotes": ["error", "double"]
    }
}
```
- env: 包含了执行环境配置，浏览器环境、node环境或支持es5、es6.
- extends: 使用的扩展配置，这里主要是引入一些集成好的检测规则
- parseOptioins: 解析器配置
- plugins: 引入的eslint插件
- rules: 用来定义具体规则，检查缩进，函数是否有返回值等。

第一个参数，如果只有一个参数，直接使用字符串或数字就可以了
- `"off"` 或 `0` - 关闭规则
- `"warn"` 或 `1` - 开启规则，使用警告级别的错误：`warn` (不会导致程序退出，即可以正常提交代码)
- `"error"` 或 `2` - 开启规则，使用错误级别的错误：`error` (当被触发的时候，程序会退出，存在error告警不能提交代码)
第二个参数：你想要的配置参数

- `"quotes": ["error", "double"]`，如果存在单引号的就报错，终止提交。
- `"quotes": ["warn", "double"]`，如果存在单引号就告警，但可以正常提交。

ESLint的[配置规则](https://cn.eslint.org/docs/rules/)

执行命令
```
yarn eslint src/*.js
```

ESLint对代码进行了检测

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/dcb84e173240448fbde6c462993f5b75~tplv-k3u1fbpfcp-watermark.image?)

**注意，如果项目根目录配置了`.eslintrc`, 那么package.json中配置了eslintConfig将不会生效**

```
module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": [
        "eslint:recommended"
    ],
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true
        },
        "ecmaVersion": "latest",
        "sourceType": "module"
    }
}
```

## 3、覆盖ESLint配置

我们看到不管是共享的配置还是使用官方推荐的配置，如果我们想要在这个基础上修改某个规则怎么办，使用overrides来覆盖，可以指定使用的范围。

```
{
  "rules": {...},
  "overrides": [
    {
      "files": ["./src/*.js"],
      "rules": {
          "no-console": "error"
       }
    }
  ]
}
```

我们可以看到no-console告警出来了。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/76f5ee8132be44129c0288df89898261~tplv-k3u1fbpfcp-zoom-1.image)

**其实ESLint还提供了创建规则，自定义解析器，编写插件的能力，下面我们主要实践下编写插件**

## 4、共享配置

> 和Prettier一样，如果每个项目都配置一个太麻烦了，可以整体使用一套
新建一个项目导出这个js文件，然后上传到npm，直接通过extends字段引用就可以了。发布流程和prettier是一样的，命名还要用eslint-config-开头。[官网](https://cn.eslint.org/docs/developer-guide/shareable-configs)

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9b460480ca5a4e55963bbeb71d3dfc02~tplv-k3u1fbpfcp-watermark.image?)

安装`yarn add -D eslint-config-frontdemo`

修改`package.json`（修改.eslintrc.js文件也是一样的，这里用了package.json的配置，所以根目录下的.eslintrc.js要删除掉）

```
"scripts": {
    "eslint": "eslint . --fix"
},
"eslintConfig": {
    "env": {
      "browser": true,
      "node": true,
      "es2021": true
    },
    "extends": "frontdemo"
}
```
执行`yarn eslint`，成功

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8c4627933500452ca9b52a476ac49cbd~tplv-k3u1fbpfcp-watermark.image?)


# 五、Git暂存区代码过滤：lint-staged

在实际使用过程，会遇到这样的问题：
- 每次都要全局处理代码，浪费时间
- 每个人对所有代码格式化，规则不同，导致大量代码冲突

> lint-staged，仅过滤Git暂存区的代码

1、安装lint-staged

```
yarn add lint-staged -D
```
2、`package.json`配置lint-staged
```
{
  "lint-staged": {
      "*.js": "prettier -w .",
      "*.js": "eslint . --fix"
  }
}
```
3、执行命令

```
# 修改业务代码
git add .
git commit -m "test lint-staged"
```
此时发现，这些命令仅对暂存区`*.js`的内容进行了格式化。


# 六、Git提交规范自动化

## 1、规范说明

> 如图所示，我们看到优秀的开源项目，对提交代码的描述信息都是很规范的。想要和这些项目一样清晰，我们可以借助插件commitlint

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3efd597cc3ab4bdfb6a8c06537dea7f2~tplv-k3u1fbpfcp-watermark.image?)

在此之前我们要了解常用的Git提交规范

```
Subject 一句话概述commit主题(必须)
<Body> 详细描述 What 和 Why (可选)
<Footer> 不兼容或关闭 issue 等说明(可选)

主题(Subject)是 commit 的简短描述，不超过50个字符
- 用一句话说明本次所作的提交, 如果一句话说不清楚，那有可能这个提交得拆分成多次
- 主要采用 Verb + Object + Adverb 的形式描述，常见动词及示例如下
1. feat: 添加代码和逻辑, 如 feat: add xxx field/method/class
2. fix: 修复bug，如 fix: #123, fix xxx error
3. docs: 文档更新，如 docs: change documents
4. style: 样式修改，如 style: add class or change style
5. refactor: 代码重构, 如refactor: rename, move, extract, inline等
6. perf: 代码性能优化，perf: improves performance
7. test: 代码单元测试，test: test menu component
8. build: 项目构建，build: build project
9. ci: 修改CI文件 ci: change gitlab-ci.yml
10. chore: 构建过程或辅助工具的变动 chore: change webpack

正文(Body)详细描述本次 commit 做了什么、为什么这样做(不是怎么做的)
- 每行不要超过70字符
1. 这个改动解决了什么问题？
2. 这个改动为什么是必要的？
3. 会影响到哪些其他的代码？
  bug fix - 组件 bug 修复；
  breaking change - 不兼容的改动；
  new feature - 新功能

尾注(Footer) 用于关闭 Issue 或存在不兼容时添加相关说明等
1. breaking change: 与上一个版本不兼容的相关描述、理由及迁移办法
2. close #issue: 关闭相关问题（附链接）
3. revert: 撤销以前的commit
```
比如我们修改了一个列表Bug：`git commit -m "bug: change id columns"`，这样我们后面查询起来就很简单了。

## 2、提交信息规范配置：commitlint

安装commitlint-cli和commitlint常用配置

```
cd font-demo

yarn add @commitlint/cli @commitlint/config-conventional -D

touch .commitlint.config.js
```
.commitlint.config.js
```
  "commitlint": {
    extends: [
      '@commitlint/config-conventional'
    ],
    rules: {
      'type-enum': [2, 'always', [
        'feat', 'fix', 'perf', 'refactor', 'build', 'style', 'docs', 'chore'
      ]],
      'type-case': [0]
    }
  }
}
```
`@commitlint/config-conventional`默认使用这个提交规范

执行命令

```
echo "this is a new feature" | commitlint
```

```
echo "feat: this is a new feature" | commitlint
```

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5ec587086d3d4c00aaf09d0b63b0cd59~tplv-k3u1fbpfcp-watermark.image?)

commitlint用来检测Git提交信息是否规范。

## 3、通过插件来规范提交信息

**虽然我们按照格式提交没有问题，但是很多时候，可能记不住这些命令，我们可以弹出提示信息进行交互式提交**

安装依赖`@commitlint/cz-commitlint`

```
yarn add -D @commitlint/cz-commitlint commitizen @commitlint/cli @commitlint/config-conventional
```

在package.json中配置

```
{
  "scripts": {
    "commit": "git add . && git-cz"
  },
  "config": {
    "commitizen": {
      "path": "@commitlint/cz-commitlint"
    }
  }
}
```

在项目根目录下新建文件[`commitlint.config.js`](https://github.com/richLpf/auto-format-demo/blob/main/commitlint.config.js)


修改业务代码，并执行命令

```
yarn commit
```

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/18cdc9f38ccb4627aabe0518c3af8710~tplv-k3u1fbpfcp-zoom-1.image)

就可以通过选择来提交代码了。

## 4、一键执行自动化工具

以上`prettier`、`esliint`、`lint-staged`、`commitlint`都配置在package.json中，通过命令`yarn commit`按顺序执行这些工具。

```
"scripts": {
    "prettier": "prettier -w .",
    "commit": "git add . && lint-staged && git-cz"
  },
  "prettier": "@isayme/prettier-config",
  "config": {
    "commitizen": {
      "path": "@commitlint/cz-commitlint"
    }
  },
  "eslintConfig": {
    "env": {
      "browser": true,
      "node": true,
      "es2021": true
    },
    "extends": "eslint:recommended"
  },
  "lint-staged": {
    "*.js": [
      "eslint . --fix",
      "prettier -w ."
    ]
  }
```
配置完成后，修改业务代码，执行`yarn commit`，发现对Git暂存区的文件依次进行了`ESLint检测`、`prettier`、`commitlint录入`，这就完成了简单的自动化工作流。

然而这种方法把git的命令覆盖了，而且可能很多人不想要每次都通过提示提交信息，那么下面我们接着看，如何通过Hooks处理自动化工作流。

# 七、Git Hooks

## 1、Git Hooks介绍

要自动化上面的流程，就要用到Git的钩子函数Hooks。

Git Hooks通过一个个钩子，允许Git在每个节点执行一些shell脚本，如果哪个阶段有问题，就会抛出错误，拒绝提交代码。

常见的Git 钩子：

**客户端钩子**：
- `pre-commit`，输入git commit调出提交信息编辑器之前，主要用来代码格式，代码检测、单元测试等。
- `prepare-commit-msg` git commit编辑器启动提交信息之前，默认信息被创建之后，主要编辑提交信息
- `commit-msg` git commit 信息提交，用来检查提交信息的格式。
- `post-commit` 在提交完成后，可以用来发送通知，提醒其他同事等。

**服务器端钩子**：
- `pre-receive`：客户端推送代码到服务器时，只会触发一次
- `update`：客户端推送代码到服务器，如果多个分支，分别触发一次
- `post-receive`：推送完成后。

整个钩子触发的时间点可以理解为：在网站上打开一个弹框输入信息，提交信息，关闭弹框的过程

- 1、点击新建按钮，弹框弹出前（pre-commit）
- 2、弹框获取初始模版信息后（prepare-commit-msg）
- 3、编辑信息以后，点击提交时（commit-msg），这时可以对提交的信息进行检测
- 4、点击保存信息完成（post-commit）

## 2、Git Hooks实践

安装Git(默认本地安装了Git)

```
cd front-demo
git init
ls -al
cd .git
cd hooks
```

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8119e8fa542049afa9cdaaf767229855~tplv-k3u1fbpfcp-zoom-1.image)

Git Hooks每个钩子都有示例文件，这些是git预置的hooks脚本示例，因为加了sample后缀，所以并不会被执行。

我们在当前目录下新建`pre-commit`脚本，文件内容如下

```
#!/bin/sh

echo "this is a test file"
```

回到项目根目录下，修改项目内任意文件，提交代码，发现成功提交，但是有告警。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/87a07c18370a44bfa30caa2841abe22c~tplv-k3u1fbpfcp-zoom-1.image)
因为`pre-commit`没有执行权限，我们给文件执行权限
```
chmod +x pre-commit
```

然后再次提交代码，发现git commit后，打印出了`this is a test file`，我们写在`.git/hooks/pre-commit`中的代码，这就说明Git Hooks触发了。

## 3、Husky实践

Hooks需要更改.git下的配置，非常不方便，所以有了Husky，将Hooks暴露在项目中。

> 安装Git Hooks，husky v4版本可以在package.json中配置，v5版本后，husky就独立在项目根目录下配置，这里使用的是`7.0.4`

```
# 安装husky
yarn add husky -D

# 激活husky的使用
yarn husky install
```

4.x.x版本在package.json中配置

```
"husky": {
   "hooks": {
      "pre-commit": "lint-staged"
   }
}
```

7.x.x版本

```
# 添加一个钩子脚本，检测Git提交信息规范
yarn husky add .husky/commit-msg 'yarn commitlint --edit $1'
```

我们看到在项目根目录下，生成了.husky文件夹，下面有Hooks相关的脚本。

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d6834453d6fb40ffba178feb6874a25e~tplv-k3u1fbpfcp-watermark.image?)

**这里不光可以使用shell脚本，用node、python脚本都可以。**

提交代码，发现如果没有按标准格式，就会被拦截。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a7d9f0c9a5594a40bf66906933529745~tplv-k3u1fbpfcp-zoom-1.image)

## 4、通过Husky自动化规范

`pre-commit`钩子：prettier和eslint检测代码格式和代码质量

`commit-msg`钩子：执行commitlint，检测提交信息是否符合格式

首先安装这两个钩子

```
yarn husky add .husky/pre-commit 'yarn lint-staged --allow-empty'
yarn husky add .husky/commit-msg 'yarn commitlint --edit $1'
```

这里lint-staged 添加允许空提交是为了避免报错[lint-staged issues](https://github.com/okonet/lint-staged/issues/588)

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/af59a2f59bd44b0f870972dfd9ef1909~tplv-k3u1fbpfcp-watermark.image?)

然后改动代码src/index.js

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cc30782b3b9a45ba8efeba65687ec973~tplv-k3u1fbpfcp-watermark.image?)

执行命令：
```
git add .
git commit -m "test"
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8166f314269d46d0b85cd652278602fb~tplv-k3u1fbpfcp-zoom-1.image)

发现检测出了不符合eslint规范的编码。

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e990d1b63d1f4b04b01624405ab37630~tplv-k3u1fbpfcp-watermark.image?)

修复eslint错误，再次提交，发现报错提交信息不规范，但代码已经格式化过了。

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ccc0982e951f4b01b5595151bed28305~tplv-k3u1fbpfcp-watermark.image?)

修改提交信息，Ok大功告成，成功提交。

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8252faf0a0f04baabcb9aebd197d199f~tplv-k3u1fbpfcp-watermark.image?)

# 八、通过CI自动化检测代码

之前介绍的是，本地提交代码的自动化检测。

那么并不是每个开发都会去注意这一块，针对提交上线的代码，除了服务器端钩子来检测，还可以通过CI/CD来检测。这块的工具也很多，常用的有：Gitlab/CI、Github/Action。

这里我们选择Github/Action

```
cd front-demo
mkdir -p .github/workflows
touch github-action.yml
```
`github-action.yml`

```
name: GitHub Actions Demo
on: [push]
jobs:
  eslint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: yarn install
      - run: yarn eslint . --fix
      
  prettier:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: echo "check current commit is prettier"
      - run: yarn install
      - run: yarn prettier:check
```
每次推送都执行下面两个任务
- 执行eslint校验
- 执行prettier检查

修改front-demo项目下的`package.json`，运行命令检查是否Prettier格式化

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0fca806b014c43048e09775cb4108cb3~tplv-k3u1fbpfcp-watermark.image?)

直接提交代码，推送Github，打开[Action页面](https://github.com/richLpf/auto-format-demo/actions/runs/1979731289)

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e5a70989da61467ca5c70656aea25702~tplv-k3u1fbpfcp-watermark.image?)
两个任务执行成功

接着注释掉本地钩子执行的 eslint和prettier，修改代码提交到远程仓库（故意打乱）

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d09b5686b0fc42a486442a3da2e2b357~tplv-k3u1fbpfcp-watermark.image?)

打开Action页面，发现任务都失败了，并且提示除了错误信息。

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a46481ff84a2470a94280764310376ac~tplv-k3u1fbpfcp-watermark.image?)

如果任务执行成功，就可以继续执行构建，部署，打包文件检测等。

当然也可以在这个阶段，增加单元测试，代码分析等操作。

# 九、参考文章
- [Prettier](https://www.prettier.cn/docs/index.html)
- [ESLint](https://cn.eslint.org/docs/user-guide/getting-started)
- [lint-staged](https://www.npmjs.com/package/lint-staged)
- [commitlint](https://commitlint.js.org/#/)
- [Husky](https://typicode.github.io/husky/#/?id=usage)
- [Github/Action](https://docs.github.com/cn/actions/quickstart)

欢迎加入讨论，如果觉得还不错，给个赞吧
