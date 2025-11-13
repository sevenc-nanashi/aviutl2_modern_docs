import { defineConfig } from "vitepress";
import { jaModel, Parser } from "budoux";
import markdownItBudoux from "markdown-it-budoux";
import { auluaGrammar } from "./extensions/aulua.ts";
import { autxtGrammar } from "./extensions/autxt.ts";
import { customFence } from "./extensions/customFence.ts";
import { asterisk } from "./extensions/asterisk.ts";
import llmstxt from "vitepress-plugin-llms";

const logoSvgUrl = "/aviutl2.svg";
const logoPngUrl = "/aviutl2.png";
const description = "AviUtl2のドキュメントを見やすくした非公式サイト";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  srcDir: "docs",

  title: "AviUtl2 Modern Docs",
  description: description,
  cleanUrls: true,
  vite: {
    plugins: [
      llmstxt({
        excludeIndexPage: false,
        customTemplateVariables: {
          title: "AviUtl2 Modern Docs",
        },
      }),
    ],
    server: {
      allowedHosts: true,
    },
  },
  transformHead(ctx) {
    ctx.head.push([
      "meta",
      {
        property: "og:title",
        content: ctx.pageData.title,
      },
    ]);
    ctx.head.push([
      "meta",
      {
        property: "og:site_name",
        content: "AviUtl2 Modern Docs",
      },
    ]);
    ctx.head.push([
      "meta",
      {
        property: "og:description",
        content: ctx.pageData.description || description,
      },
    ]);
    ctx.head.push([
      "meta",
      {
        property: "og:type",
        content: "website",
      },
    ]);
    ctx.head.push([
      "meta",
      {
        property: "og:image",
        content: logoPngUrl,
      },
    ]);
    ctx.head.push([
      "meta",
      {
        name: "twitter:card",
        content: "summary",
      },
    ]);
    ctx.head.push([
      "meta",
      {
        name: "twitter:title",
        content: ctx.pageData.title,
      },
    ]);
    ctx.head.push([
      "meta",
      {
        name: "twitter:description",
        content: ctx.pageData.description || description,
      },
    ]);
    ctx.head.push([
      "meta",
      {
        name: "twitter:image",
        content: logoPngUrl,
      },
    ]);
    ctx.head.push([
      "link",
      {
        rel: "icon",
        href: logoSvgUrl,
      },
    ]);
    ctx.head.push([
      "link",
      {
        rel: "apple-touch-icon",
        href: logoPngUrl,
      },
    ]);
  },
  markdown: {
    breaks: true,
    config: (md) => {
      md.use(markdownItBudoux({ language: "ja" }));
      md.use(
        customFence({
          languageLabels: {
            aulua: "AviUtl2 Lua",
            autxt: "AviUtl2 Text",
          },
        }),
      );
      md.use(asterisk);
    },
    container: {
      noteLabel: "補注",
    },
    codeCopyButtonTitle: "コピー",
    shikiSetup: async (shiki) => {
      await shiki.loadLanguage("hlsl");
      await shiki.loadLanguage(auluaGrammar);
      await shiki.loadLanguage(autxtGrammar);
    },
  },
  themeConfig: {
    nav: [{ text: "ホーム", link: "/" }],
    search: {
      provider: "local",
      options: {
        miniSearch: {
          options: {
            tokenize: (term) => {
              const patchedGlobal = globalThis as unknown as {
                __au2dm_budouxParser?: Parser;
              };
              if (!patchedGlobal.__au2dm_budouxParser) {
                if (typeof process !== "undefined") {
                  // Node環境（SSR）ではParserをここで初期化する
                  patchedGlobal.__au2dm_budouxParser = new Parser(jaModel);
                } else {
                  throw new Error(
                    "Unreachable: budoux parser is not initialized",
                  );
                }
              }

              return term
                .split(/[\s-、。.,・]+/)
                .flatMap((t) => patchedGlobal.__au2dm_budouxParser!.parse(t));
            },
          },
        },
        locales: {
          root: {
            translations: {
              button: {
                buttonAriaLabel: "検索",
                buttonText: "検索",
              },
              modal: {
                backButtonTitle: "戻る",
                displayDetails: "詳細を表示",
                noResultsText: "何も見つかりませんでした",
                resetButtonTitle: "リセット",
                footer: {
                  closeText: "で閉じる",
                  navigateText: "で移動",
                  selectText: "で選択",
                },
              },
            },
          },
        },
      },
    },

    sidebar: [
      {
        text: "aviutl2.txt",
        items: [
          { text: "はじめに", link: "/" },
          { text: "簡易説明", link: "/usage" },
          { text: "更新履歴", link: "/changelog" },
        ],
      },
      {
        text: "lua.txt",
        base: "/lua",
        items: [
          { text: "Luaスクリプト", link: "/" },
          { text: "使用例", link: "/examples" },
          { text: "更新履歴", link: "/changelog" },
          { text: "バイナリについて", link: "/binaries" },
        ],
      },
      { text: "このサイトについて", link: "/about" },
    ],

    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/aviutl2/aviutl2_modern_docs",
      },
    ],

    externalLinkIcon: true,
    skipToContentLabel: "内容にジャンプ",
    langMenuLabel: "言語",
    lastUpdatedText: "最終更新",
    sidebarMenuLabel: "メニュー",
    notFound: {
      title: "ページが見つかりません",
      linkLabel: "トップページに戻る",
      linkText: "トップページへ",
      quote: "お探しのページは見つかりませんでした。",
    },
    lightModeSwitchTitle: "ライトモードに切り替え",
    darkModeSwitchLabel: "外観",
    darkModeSwitchTitle: "ダークモードに切り替え",
    returnToTopLabel: "上までスクロール",
    outline: {
      label: "このページの内容",
      level: [2, 3],
    },

    docFooter: {
      prev: "前へ",
      next: "次へ",
    },

    logo: logoSvgUrl,

    footer: {
      message: "AviUtl2 Modern Docsは有志が作成した非公式ミラーサイトです。",
      copyright: "© 2025 Nanashi. / Original work by KEN-kun.",
    },
  },
});
