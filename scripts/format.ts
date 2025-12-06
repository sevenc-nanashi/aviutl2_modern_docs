/**
 * Vitepressで使われているVue入りMarkdownを整形するスクリプト。
 * 具体的には以下の処理を行う：
 * - Markdownファイル全体をPrettierで整形する
 * - mdast-util-from-markdownを使ってHTML部分を抽出し、Vueの部分だけPrettierで整形する
 *   - この時、Vueの部分は`<script>`タグでは無い限りは`<template>`タグで囲んであるものとして扱う
 *
 * 使い方:
 * - `--check`：ファイルが整形されているかチェックする
 * - `--write`：ファイルを整形する
 * - `--verbose`：差分を表示する
 */
import { glob, readFile, writeFile } from "node:fs/promises";
import { styleText } from "node:util";
import { format as prettier } from "prettier";
import { fromMarkdown } from "mdast-util-from-markdown";
import { createPatch } from "diff";
import * as tempy from "tempy";

type AstRoot = ReturnType<typeof fromMarkdown>;

const { mode, verbose } = parseArgs();
main().catch((e) => {
  console.error(styleText("red", String(e)));
  process.exit(1);
});

async function main() {
  console.log(
    `Mode: ${
      mode === "check" ? styleText("green", "Check") : styleText("red", "Write")
    }${verbose ? " (Verbose)" : ""}`,
  );

  let changedCount = 0;
  for await (const filePath of glob("./docs/**/*.md")) {
    process.stdout.write(`${filePath}: `);

    const source = await readFile(filePath, "utf8");
    const result = await formatMarkdown(source);
    if (source !== result) {
      changedCount++;
      if (mode === "write") {
        await writeFile(filePath, result);
      }
    }

    printResult(filePath, source, result);
  }

  if (mode === "check") {
    console.log(`${changedCount} files need formatting`);
    if (changedCount > 0) {
      throw new Error("Some files need formatting");
    }
  } else {
    console.log(`Formatted ${changedCount} files`);
  }
}

function parseArgs() {
  const help = process.argv.includes("--help");

  const check = process.argv.includes("--check");
  const write = process.argv.includes("--write");
  const verbose = process.argv.includes("--verbose");

  if (help || (!check && !write)) {
    console.log(`Usage: tools/format.ts [--check|--write] [--verbose]`);
    process.exit(0);
  }

  if (check && write) {
    throw new Error("Cannot use both --check and --write");
  }

  return { mode: check ? "check" : "write", verbose };
}

function dedent(source: string): string {
  const lines = source.split("\n");
  const indent = lines
    .filter((line) => line.trim() !== "")
    .map((line) => line.match(/^\s*/)![0].length)
    .reduce((a, b) => Math.min(a, b), Infinity);
  return lines.map((line) => line.slice(indent)).join("\n");
}

async function formatVueLike(segment: string): Promise<string> {
  if (segment === "<kbd>" || segment === "</kbd>") {
    // kbdタグだけの場合：そのまま返す
    return segment;
  }
  if (segment.trimStart().startsWith("<script")) {
    // scriptっぽい場合：そのまま整形
    const base = await prettier(segment, {
      parser: "vue",
    });
    return dedent(base).trim();
  } else {
    const trimLinePattern = /^\n+|\n+$/g;
    // scriptでない場合：templateタグで囲んで整形した後に、templateタグを取り除いて先頭のインデントを取り除く
    const base = await prettier(`<template>${segment}</template>`, {
      parser: "vue",
    });
    return dedent(
      base
        .replace(trimLinePattern, "")
        .slice("<template>".length, -"</template>".length)
        .replace(trimLinePattern, ""),
    ).trim();
  }
}

type Node = {
  type: string;
  position: {
    start: {
      offset: number;
    };
    end: {
      offset: number;
    };
  };
};
type HtmlNode = Node & {
  type: "html";
};
type CodeNode = Node & {
  type: "code";
  lang: string | null;
  meta: string | null;
  value: string;
};

function findNodes<T extends Node>(
  node: Node,
  visit: (node: Node) => node is T,
): T[] {
  const nodes: T[] = [];
  const traverse = (node: Node) => {
    if (visit(node)) {
      nodes.push(node as T);
    }
    if ("children" in node) {
      for (const child of node.children as Node[]) {
        traverse(child);
      }
    }
  };

  traverse(node);

  return nodes;
}

async function formatMarkdown(source: string): Promise<string> {
  const baseFormatted = await prettier(source, {
    parser: "markdown",
  });
  const ast = fromMarkdown(baseFormatted);

  let replaced = baseFormatted;
  replaced = await formatHtmlNodes(ast, replaced);
  replaced = await formatLuaNodes(ast, replaced);

  return replaced;
}

async function formatHtmlNodes(ast: AstRoot, baseFormatted: string) {
  const htmlNodes = findNodes(ast as Node, (node): node is HtmlNode => {
    if (node.type !== "html") {
      return false;
    }
    const nodeContent = baseFormatted
      .slice(node.position.start.offset, node.position.end.offset)
      .trim();

    if (nodeContent.match(/^<\/?[^>]+>$/)) {
      return false;
    }

    return true;
  });

  // 処理を楽にするために、後ろから処理する
  htmlNodes.sort((a, b) => {
    return b.position.start.offset - a.position.start.offset;
  });

  // HTML部分を切り取って整形して、元のMarkdownの部分を置き換える
  let replaced = baseFormatted;
  for (const node of htmlNodes) {
    const nodeContent = replaced.slice(
      node.position.start.offset,
      node.position.end.offset,
    );
    const formattedNode = await formatVueLike(nodeContent);

    replaced =
      replaced.slice(0, node.position.start.offset) +
      formattedNode +
      replaced.slice(node.position.end.offset);
  }
  return replaced;
}

async function formatLuaNodes(ast: AstRoot, baseFormatted: string) {
  const codeNodes = findNodes(
    ast as Node,
    (node): node is CodeNode =>
      !!(
        node.type === "code" &&
        "lang" in node &&
        typeof node.lang === "string" &&
        node.lang &&
        node.lang.toLowerCase() === "aulua" &&
        !(
          "meta" in node &&
          typeof node.meta === "string" &&
          node.meta.includes("noformat")
        )
      ),
  );

  if (codeNodes.length === 0) {
    return baseFormatted;
  }

  // 処理を楽にするために、後ろから処理する
  codeNodes.sort((a, b) => {
    return b.position.start.offset - a.position.start.offset;
  });

  return await tempy.temporaryDirectoryTask(
    async (dir) => {
      // Lua部分を切り取って整形して、元のMarkdownの部分を置き換える
      let replaced = baseFormatted;
      const codeBlocks: {
        original: string;
        path: string;
        node: CodeNode;
        indent: string;
        leading: string;
        ifEnded: boolean;
      }[] = [];
      for (const [i, node] of codeNodes.entries()) {
        const nodeContent = replaced.slice(
          node.position.start.offset,
          node.position.end.offset,
        );
        const indent = nodeContent.match(/(?<=\n)[^\n]*(?=```$)/)?.[0];
        if (indent === undefined) {
          throw new Error("Failed to detect indent");
        }
        const leading = nodeContent.match(/^[^\S\n]*/)?.[0] ?? "";
        let cleanedNodeContent = nodeContent
          .replace(new RegExp(`^${RegExp.escape(indent)}`, "gm"), "")
          .replace(/^\s*```aulua\s*/, "")
          .replace(/\s*```\s*$/, "")
          .replace(/^@/gm, "-- AU2DM_AT_SYMBOL ");

        let isIfEndedCode = false;
        if (cleanedNodeContent.trim().endsWith("then")) {
          // ifで終わっているコードの場合、styluaがエラーになるので、無理やりendを追加する
          cleanedNodeContent += "\nend";
          isIfEndedCode = true;
        }
        const tempFilePath = `${dir}/codeblock-${i}.lua`;
        await writeFile(tempFilePath, cleanedNodeContent, "utf8");
        codeBlocks.push({
          original: cleanedNodeContent,
          path: tempFilePath,
          node,
          indent,
          leading,
          ifEnded: isIfEndedCode,
        });
      }

      const stylua = Bun.spawn(["stylua", ...codeBlocks.map((b) => b.path)]);
      if ((await stylua.exited) !== 0) {
        const stderr = await new Response(stylua.stderr).text();
        throw new Error(`stylua failed: ${stderr}`);
      }
      for (const codeBlock of codeBlocks) {
        let formattedNode = await readFile(codeBlock.path, "utf8");
        let formattedNodeOutput = formattedNode
          .trim()
          .replace(/^-- AU2DM_AT_SYMBOL /gm, "@");
        if (codeBlock.ifEnded) {
          // 無理やり追加したendを削除する
          formattedNodeOutput = formattedNodeOutput.replace(/\nend\s*$/, "");
        }
        replaced =
          replaced.slice(0, codeBlock.node.position.start.offset) +
          "```aulua\n" +
          codeBlock.leading +
          formattedNodeOutput.replace(/^/gm, codeBlock.indent) +
          "\n" +
          codeBlock.indent +
          "```" +
          replaced.slice(codeBlock.node.position.end.offset);
      }
      return replaced;
    },
    {
      prefix: "au2dm-format-",
    },
  );
}
function printDiff(filePath: string, source: string, result: string) {
  // patchの先頭のIndexとかを削除。
  const diff = createPatch(filePath, source, result).replace(
    /[\s\S]+?(?=@@)/,
    "",
  );
  console.log("=".repeat(80));
  for (const line of diff.split("\n")) {
    if (line.startsWith("-")) {
      console.log(styleText("red", line));
    } else if (line.startsWith("+")) {
      console.log(styleText("green", line));
    } else {
      console.log(styleText("gray", line));
    }
  }
  console.log("=".repeat(80));
}

function printResult(filePath: string, source: string, result: string) {
  if (source !== result) {
    if (mode === "check") {
      console.log(styleText("red", "Needs formatting"));
    } else {
      console.log(styleText("green", "Formatted"));
    }

    if (verbose) {
      printDiff(filePath, source, result);
    }
  } else {
    console.log(styleText("gray", "No changes"));
  }
}
