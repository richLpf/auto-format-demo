# 一、前端代码规范工具

## 1、前言

代码规范如果靠人来监督和处理，那么就会有很大的工作量了。

于是就有了各种工具，但各种工具功能重复，配置相互冲突、复杂的指令又让人头疼。

所以这一篇我们从工程化的角度出发，选择合适的工具，处理代码规范、检测代码质量、规范提交说明，然后结合Git Hooks将这些工具串联起来，达到自动化规范代码的目的。

[本文代码示例参考]()


## 2、工具分类介绍

检测代码的工具很多，主要分为三类：

- 一类是代码格式化工具，专注代码结构美化，不处理任何有关语法的内容

    - [`Prettier`](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/29e62e3c6c514314b06e0f37aca21b3b~tplv-k3u1fbpfcp-zoom-1.image)：专注代码格式化
    - [`Stylelint`](https://stylelint.io/)：专注CSS语法格式化

- 一类是lint类，这些工具也支持处理代码格式，但重点是检测代码语法质量

    - [`ESLint`](https://cn.eslint.org/): 可以配置代码格式规则，也可以检测代码语法质量

- 一类是将不同的工具进行合成，成为一个包含子功能或者有定制功能的插件，可以避免Prettier和Lint二者在代码处理上的冲突。

    -   [eslint-config-prettier](https://github.com/prettier/eslint-config-prettier)：ESLint检测和Prettier格式化
    -   [tslint-config-prettier](https://github.com/alexjoverm/tslint-config-prettier)：TS检测和代码格式化
    -   [lint-staged](https://github.com/okonet/lint-staged#readme)：仅过滤Git暂存区上的文件，可以有效避免每次提交处理所有文件。

通过上面的介绍，我们发现这些工具各种重复，选择小而精还是大而全，需要根据使用场景来确定。
- 比如写一个主题样式（CSS较多），那你必然要选择Stylelint；
- 开发一个产品项目，如果都用小而精的处理，那么就会导致项目越来越复杂，此时不妨使用大而全的。

大多工具都会提供
- Package.json配置
- 定制规范文件，一般支持隐藏文件，单个文件、json、yml、js等
- 都可以定制规则、覆盖规则
- 提供忽略检测的文件
- 提供插件开发
- 编辑器集成

**这些工具配置都比较相似，但尤其要注意版本的不同，导致的配置不同。**

## 3、主要内容

这篇文章主要集中在这三部分内容：
- 1、主要具体需求来通过介绍插件的使用
- 2、通过Git Hooks来将这些工具在代码提交阶段发挥他们的作用。
- 3、通过CI在提交后开启代码检测

## 4、本文环境

下面实践依赖的环境
- 系统：mac m1
- Git版本：2.24.3
- npm版本：7.21.1
- Husky版本：7.0.4
- Nodejs版本：v16.9.0


# 二、代码检测、格式化工具

## 1、代码格式美化：Prettier

-  新建一个项目`front-demo`
-  执行`npm init`，一路回车
-  新建文件`index.html`，`src/index.js`

目录结构如图：

![image-20220305094227258](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0b768a07057744e9b8984063085d3f8a~tplv-k3u1fbpfcp-zoom-1.image)

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

在`package.json`配置命令`prettier`

```
"scripts": {
    "test": "echo "Error: no test specified" && exit 1",
    "prettier": "prettier -w ."
},
```

这样我们执行`yarn prettier`命令就可以了

`prettier`格式有一套默认的格式化规则，一般情况下，选择默认就可以了

当然也可以自行配置，下面有两种配置方法：
- 在package.json中添加关键词`prettier`
- 在项目根目录下新建`.prettierrc`文件，json、yaml等文件都可以。

两者具体的配置是一样的，配置规则可以在[官方站点查看](https://www.prettier.cn/docs/options.html)。

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

**覆盖配置**：修改`.prettierrc`文件，添加`overrides`字段

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

**共享配置**：项目的配置一般都不会变化，所以常常多个项目使用同一个配置，特别是针对大点的项目，每次都要重新配置，会很麻烦。这时候，我们可以通过远程仓库来共享一份配置。

在`package.json`中，添加远程仓库地址：

```
{
  "name": "my-app",
  "prettier": "github/config-prettier"
}
```

**忽略文件**：如果想要忽略某个文件的格式化，可以新建文件`.prettierignore`，添加要忽略的文件

```
/dist
*.html
```

`Prettier`还有很多其他的能力，比如整合编辑器、配合lint使用、插件、配合Git Hooks使用等，这里仅展示基础的能力，具体可以根据需要查看文档

## 2、代码质量检测：ESLint

安装ESLint插件

`yarn add eslint -D`

执行命令

```
yarn add eslint --init
```

在package.json中定义配置

```
"eslintConfig": {
    "env": {
      "browser": true,
      "node": true,
      "es2021": true
    },
    "extends": "eslint:recommended"
}
```

根据需要选择eslint规则，最后在根目录下生成`.eslintrc.js`，文件如下

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
    }
}
```

其中包含了执行环境配置、使用的扩展配置、解析器配置、插件和定义的解析规则，我们根据自己的需要修改即可。

执行命令

```
yarn eslint src/*.js
```

在package.json中配置命令行

```
"scripts": {
    "test": "echo "Error: no test specified" && exit 1",
    "eslint": "eslint ./src/*.js"
}
```

我们发现，eslint对代码进行了检测，并告警出一些无效的定义。

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/dcb84e173240448fbde6c462993f5b75~tplv-k3u1fbpfcp-watermark.image?)




**注意，如果项目根目录配置了`.eslintrc`, 那么package.json中配置了eslintConfig将不会生效**

此时执行命令，发现结果也是一样的。

```
yarn eslint ./src/*.js
```

**共享配置**

> 和Prettier一样，如果每个项目都配置一个太麻烦了，可以整体使用一套，大部分其实可以使用官方推荐的，也可以自行配置

```
待实践
```

**覆盖ESLint配置**

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

## 3、编写一个ESLint插件

## 4、Git暂存区代码过滤：Stagelint

有了Prettier和ESLint可以轻松的帮助我们实现代码格式化和代码质量检测。但是在实际使用过程中却会遇到这样的问题，每次都要全局处理代码，浪费时间不说，也会多人处理过程中的代码冲突，那么怎么办呢？

使用Stagelint，仅过滤执行暂存区的代码

1、安装Stagelint

```
yarn add lint-staged -D
```

2、package.json配置lint-staged

```
{
  "lint-staged": {
      "*.js": "prettier -w ."
  }
}
```

3、执行命令

```
# 修改业务代码
git add .
git commit -m "test lint-staged"
```

此时发现，这些命令仅仅对暂存区的内容进行了代码格式化。

当然，还可以在根目录下新建文件配置`lintstagedrc.json`, 具体配置和`package.json`中配置的一样。

## 5、Git提交规范说明

提交信息随便写，什么`test`、`暂存了`，嗯，我也干过，但现在改了。优秀的信息说明要有一定的格式，方便查找历史提交记录，而且赏心悦目。

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3ccfa0c7b79f4f2ba03167e6c2288ef9~tplv-k3u1fbpfcp-zoom-1.image)

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e8f6cc0cec224b51a31d5c75d8195ba5~tplv-k3u1fbpfcp-zoom-1.image)

其实这些问题的解决并不难，只要态度到位，操作熟练加上点规范，分分钟钟变得优秀。

> 代码提交规范，其实重要性没那么高，只会在代码review和历史数据查询的时候使用，但规范的提交可以帮助你更好的记录代码的更新。

```
Subject 一句话概述commit主题(必须)
<Body> 详细描述 What 和 Why (可选)
<Footer>不兼容或关闭 issue 等说明(可选)
​
主题(Subject)是 commit 的简短描述，不超过50个字符
- 用一句话说明本次所作的提交, 如果一句话说不清楚，那有可能这个提交得拆分成多次
- 主要采用 Verb + Object + Adverb 的形式描述，常见动词及示例如下
1. Add: 添加代码和逻辑, 如 Add xxx field/method/class
2. Change: 代码更新，如 Change xxx to yyy with reason
3. Remove: 删除旧特性/功能，如 Remove xxx which was deprecated
4. Fix: 修复bug，如 Fix #123, fix xxx error
5. Update/Release: maven 版本变更， Update/Release xxx version to 1.0.0
6. Refactor: 代码重构, 如rename, move, extract, inline等
7. Polishing: 代码打磨(代码格式化，不涉及逻辑调整，使代码更清晰易读等无错修改)
​
正文(Body)详细描述本次 commit 做了什么、为什么这样做(不是怎么做的)
- 每行不要超过70字符
1. 这个改动解决了什么问题？
2. 这个改动为什么是必要的？
3. 会影响到哪些其他的代码？
  bug fix - 组件 bug 修复；
  breaking change - 不兼容的改动；
  new feature - 新功能
​
尾注(Footer) 用于关闭 Issue 或存在不兼容时添加相关说明等
1. breaking change: 与上一个版本不兼容的相关描述、理由及迁移办法
2. close #issue: 关闭相关问题（附链接）
3. revert: 撤销以前的commit
```

## 6、Git提交规范实践

**提交信息规范配置：commitlint**

> 安装commitlint和commitlint开发的规范配置

```
yarn add @commitlint/cli @commitlint/config-conventional -D
```

安装完毕后，同样`commitlint`有多种配置方式，可以在`package.json中`配置，也可以新建文件`.commitlint.config.js`、`.commitlintrc.js`

```
// package.json
{
  "commitlint": {
    extends: [
      '@commitlint/config-conventional'
    ],
    rules: {
      'type-enum': [2, 'always', [
        'feature', 'update', 'fixbug', 'refactor', 'optimize', 'style', 'docs', 'chore'
      ]],
      'type-case': [0]
    }
  }
}
```

`@commitlint/config-conventional`已经默认了很多提交规则，如果需要进行覆盖，就在下面接着增加配置

执行命令

```
echo "this is a new feature" | commitlint
```

```
echo "feat: this is a new feature" | commitlint
```

以上就是commitlint的用法，它的主要作用就是检测提交信息是否规范，那么具体使用在项目中需要配合`Git Hooks`,我们在下面介绍。


# 三、Git Hooks

## 1、Git Hooks说明

Git的钩子函数，是我们后面用来做自动化很方便的一个部分，这里配置一下，为后面铺路。

Git Hooks在每次Git命令执行前，允许我们做一些操作。

-   Pritter
-   ESLint
-   Commitlint
-   自动化测试

为保证代码的格式化规范、语法规范、提交信息规范、单元测试等，但单个命令非执行有非常麻烦，那么这时我们就可以在代码提交钱进行这些步骤。为了实现自动化处理，我们可以借助Git Hooks。

Git Hooks在项目目录下的`.git`目录中的hooks中，而且每个钩子都有示例文件。

我们可以尝试Git在每个执行阶段可以自定义执行逻辑。如果正常退出就会继续执行，如果非正常退出就会中断Git操作，它帮助我们在代码提交的过程中，随时终止某个节点。

目前高版本的Hooks可以直接通过.Husky目录，来管理这些钩子。

首先，我们先安装Husky，然后会发现项目根目录下多了一个`.Husky`目录。

`yarn add husky -D`

**客户端钩子**：

**服务器端钩子**：

Git勾子触发的节点图：


## 2、通过Git Hooks自动化处理代码规范

上面每个过程我们都可以单独执行，那么每次单独执行脚本，也是很痛苦的，这时候我们Git Hooks就该上场了。

Git通过一个个钩子，将这些过程都串联起来，如果哪个阶段有问题，就会抛出错误，拒绝提交代码

## 3、Git Hooks初体验

安装Git(默认本地安装了Git)

```
git init
```

安装完毕后，执行命令

```
ls -al
cd .git
cd hooks
```

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8119e8fa542049afa9cdaaf767229855~tplv-k3u1fbpfcp-zoom-1.image)

会发现在hooks文件夹下有很多sample脚本，这些事git预制的一些hooks脚本示例，因为加了sample后缀，所以并不会被执行。我们在当前目录下心间`pre-commit`文件，文件内容如下

```
#!/bin/sh

echo "this is a test file"
```

回到项目根目录下，修改项目内任意文件，提交代码，发现成功提交，但是有告警pre-commit没有执行权限，我们给文件执行权限

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/87a07c18370a44bfa30caa2841abe22c~tplv-k3u1fbpfcp-zoom-1.image)

```
chmod +x pre-commit
```

然后重复提交代码指令，发现git commit后，打印出了this is a test file，我们写在`.git/hooks/pre-commit`中的代码。

我们可以看到有很多hooks，每个hooks都是在git的某个阶段才会执行，总共分成三个主要的部分，每个阶段读取的变量也会有所不同。


> 安装GitHooks，husky v4版本可以在package.json中配置，升级到高版本后，husky就独立在项目根目录下配置，这里使用的是`7.0.4`

```
# 这里使用yarn安装husky
yarn add husky -D
​
# 激活husky的使用
yarn husky install
```

4.x.x版本在package.json中配置

```
"husky": {
   "hooks": {
      "pre-commit": "lint-staged -c @ucloud/console-dev-dependences/config/.lintstagedrc"
   }
}
```

7.x.x版本

```
# or
yarn husky add .husky/commit-msg 'yarn commitlint --edit $1'
```

我们可以看到在项目根目录下，生成.husky文件夹，下面有Hooks相关的脚本。

**其实这里不光可以使用shell脚本，用node、python脚本都可以。**

![]()

提交代码，发现如果没有按标准格式，就会被拦截。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a7d9f0c9a5594a40bf66906933529745~tplv-k3u1fbpfcp-zoom-1.image)

**虽然我们按照格式提交没有问题，但是很多时候，可能记不住这些命令，如果能够弹出指令进行选择就好了，这里我们选择@commitlint/cz-commitlint，来进行配置**

安装依赖

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

在项目根目录下新建文件`commitlint.config.js`

```
module.exports = {
  extends: ['@commitlint/config-conventional'],
  prompt: {
    questions: {
      type: {
        description: "Select the type of change that you're committing",
        enum: {
          feat: {
            description: 'A new feature',
            title: 'Features',
            emoji: '✨'
          },
          fix: {
            description: 'A bug fix',
            title: 'Bug Fixes',
            emoji: '🐛'
          },
          docs: {
            description: 'Documentation only changes',
            title: 'Documentation',
            emoji: '📚'
          },
          style: {
            description:
              'Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)',
            title: 'Styles',
            emoji: '💎'
          },
          refactor: {
            description: 'A code change that neither fixes a bug nor adds a feature',
            title: 'Code Refactoring',
            emoji: '📦'
          },
          perf: {
            description: 'A code change that improves performance',
            title: 'Performance Improvements',
            emoji: '🚀'
          },
          test: {
            description: 'Adding missing tests or correcting existing tests',
            title: 'Tests',
            emoji: '🚨'
          },
          build: {
            description:
              'Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)',
            title: 'Builds',
            emoji: '🛠'
          },
          ci: {
            description:
              'Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)',
            title: 'Continuous Integrations',
            emoji: '⚙️'
          },
          chore: {
            description: "Other changes that don't modify src or test files",
            title: 'Chores',
            emoji: '♻️'
          },
          revert: {
            description: 'Reverts a previous commit',
            title: 'Reverts',
            emoji: '🗑'
          }
        }
      },
      scope: {
        description: 'What is the scope of this change (e.g. component or file name)'
      },
      subject: {
        description: 'Write a short, imperative tense description of the change'
      },
      body: {
        description: 'Provide a longer description of the change'
      },
      isBreaking: {
        description: 'Are there any breaking changes?'
      },
      breakingBody: {
        description: 'A BREAKING CHANGE commit requires a body. Please enter a longer description of the commit itself'
      },
      breaking: {
        description: 'Describe the breaking changes'
      },
      isIssueAffected: {
        description: 'Does this change affect any open issues?'
      },
      issuesBody: {
        description:
          'If issues are closed, the commit requires a body. Please enter a longer description of the commit itself'
      },
      issues: {
        description: 'Add issue references (e.g. "fix #123", "re #123".)'
      }
    }
  }
};
```

修改业务代码，并执行命令

```
yarn commit
```

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/18cdc9f38ccb4627aabe0518c3af8710~tplv-k3u1fbpfcp-zoom-1.image)

就可以通过选择来提交代码了。

# 四、用Git Hooks管理这些规范处理

上面我们通过Prettier、ESLint、Stagelint、

当然除了这些常用的配置，我们还可以选择的有很多，根据需要选择替换就行了。

# 五、版本规范

我们通过Git Tag来管理项目的版本号，版本号基本都熟悉，这里简单介绍下。

具体工作中，版本很多时候除非有专门的管理，否则很容易就会被忽视，除非是哪些版本号很敏感的公开库或软件。

那么我们还是要讲下如何制定版本号。现在通用的版本号，主要是遵循语义化版本 2.0.0：

版本格式：主版本号.次版本号.修订号，版本号递增规则`X.Y.Z`如下：

1.  主版本号X：当你做了不兼容的 API 修改，
2.  次版本号Y：当你做了向下兼容的功能性新增，
3.  修订号Z：当你做了向下兼容的问题修正。

先行版本号及版本编译信息可以加到“主版本号.次版本号.修订号”的后面，作为延伸。

-   X、Y、Z分别为非负整数，依次递增，向下兼容。

-   X.Y.Z 版本号的更新如：

    -   小Bug迭代：`1.1.1 -> 1.1.2`
    -   新增功能：`1.1.2 -> 1.2.0`
    -   大版本更新不兼容之前版本：`1.2.1 -> 2.0.0`

-   X 如果为0则代表当前版本为开发阶段，1则为第一个公开版本，X更新Y和Z从0开始计数，Y更新Z要从0开始。

-   最后在X.Y.Z后面加上短线和说明来扩展特殊的版本

    -   alpha: 内部版本，例如`1.1.0-alpha.1`，代表版本号为1.1.0的第一个内部测试版本
    -   beta: 测试版本，例如`1.1.0-beta.1`，代表版本号为1.1.0的第一个公开测试版本
    -   RC(Release Candidate)，例如：`1.1.0-rc1`，代表版本号为1.1.0的第一个预发布版本
    -   stable: 稳定版本，例如`1.1.0-stable`，代表这是一个稳定版本

其实上面这些版本都已经完全足够你使用了，但是维护版本号确实很分神费力的工作。

这里我们先在实际项目中展示一个比较简单的方案，来管理（所有）前端项目版本号，即将版本号工程化。
