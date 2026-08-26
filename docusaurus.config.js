// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import { themes as prismThemes } from "prism-react-renderer";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "EagleEye",
  tagline:
    "FRC vision that gets your robot pose on NetworkTables. Install it, point a camera at an AprilTag, and go.",
  favicon: "img/favicon.ico",

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: "https://scythe-engineering.github.io",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/EagleEye-Docs/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "Scythe-Engineering",
  projectName: "EagleEye-Docs",
  deploymentBranch: "gh-pages",
  trailingSlash: false,

  onBrokenLinks: "throw",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: "./sidebars.js",
          editUrl: undefined,
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      }),
    ],
  ],

  themes: [
    [
      "@easyops-cn/docusaurus-search-local",
      /** @type {import('@easyops-cn/docusaurus-search-local').PluginOptions} */
      ({
        hashed: true,
        indexBlog: false,
        // ponytail: English-only tokenizer; add `language` if docs go multilingual
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: "img/ui-screenshots/pipeline-tab.png",
      metadata: [
        {
          name: "description",
          content:
            "Operator docs for EagleEye, the FRC vision system: install it, set up an AprilTag pipeline, and publish robot pose to NetworkTables.",
        },
      ],
      colorMode: {
        defaultMode: "dark",
        disableSwitch: true,
        respectPrefersColorScheme: false,
      },
      navbar: {
        title: "EagleEye",
        logo: {
          alt: "EagleEye logo",
          src: "img/favicon.ico",
        },
        items: [
          {
            type: "docSidebar",
            sidebarId: "userGuide",
            position: "left",
            label: "User Guide",
          },
          {
            type: "docSidebar",
            sidebarId: "codebaseDocs",
            position: "left",
            label: "Developer Docs",
          },
          {
            href: "https://github.com/Scythe-Engineering/EagleEye-Vision-System",
            label: "GitHub",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Docs",
            items: [
              {
                label: "User Guide",
                to: "/docs/user-guide/overview",
              },
              {
                label: "Developer Docs",
                to: "/docs/codebase/overview",
              },
            ],
          },
          {
            title: "Resources",
            items: [
              {
                label: "GitHub",
                href: "https://github.com/Scythe-Engineering/EagleEye-Vision-System",
              },
              {
                label: "Troubleshooting",
                to: "/docs/user-guide/troubleshooting",
              },
              {
                label: "License",
                to: "/docs/user-guide/license",
              },
            ],
          },
        ],
        copyright: `© ${new Date().getFullYear()} Scythe Engineering — EagleEye Vision System.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
