// prettier.config.js or .prettierrc.js
// 这里给的值都是默认值，基本都不需要改动
module.exports = {
    trailingComma: 'es5', // 默认值在 v2.0.0 中从 更改none为es5，"es5":在 ES5 中有效的尾随逗号（对象、数组等）"none"- 没有尾随逗号。"all"- 尽可能使用尾随逗号
    tabWidth: 2, // 指定每个缩进级别的空格数。
    semi: false, // 在语句的末尾打印分号。
    singleQuote: true, // 使用单引号而不是双引号。
    useTabs: false, // 使用tab键缩进而不是空格缩进。
    printWidth: 80, //编辑器展示代码最长距离，超过换行，单位字符。
    jsxSingleQuote: false, // 在 JSX 中使用单引号而不是双引号。
    bracketSpacing: true, // 在对象文字中的括号之间打印空格。true- 示例：{ foo: bar }。false- 示例：{foo: bar}。
    bracketSameLine: false, // 将>多行 HTML（HTML、JSX、Vue、Angular）元素放在最后一行的末尾，而不是单独放在下一行（不适用于自闭合元素）。
    arrowParens: 'always', // "always"- 始终包括括号。例子：(x) => x, "avoid"- 尽可能省略括号。例子：x => x
    requirePragma: false, // 声明格式文件，开启后，仅头部声明的文件进行格式化。用来过度之前没有使用格式化的文件。
    embeddedLanguageFormatting: 'auto', // "auto"- 如果 Prettier 可以自动识别嵌入代码，请格式化它。"off"- 永远不要自动格式化嵌入代码。
}
