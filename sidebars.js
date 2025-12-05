// @ts-check

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.

 @type {import('@docusaurus/plugin-content-docs').SidebarsConfig}
 */
const sidebars = {
  docs: [
    {
      type: 'category',
      label: 'User Guide',
      link: {type: 'doc', id: 'user-guide/overview'},
      items: [
        'user-guide/setup',
        'user-guide/configuration',
        'user-guide/running',
        'user-guide/troubleshooting',
      ],
    },
    {
      type: 'category',
      label: 'Codebase Docs',
      link: {type: 'doc', id: 'codebase/overview'},
      items: [
        {
          type: 'category',
          label: 'Pipelines',
          link: {type: 'doc', id: 'codebase/pipelines/overview'},
          items: [
            'codebase/pipelines/configuration',
            'codebase/pipelines/operation-definitions',
            'codebase/pipelines/secondary-operations',
            'codebase/pipelines/add-operation',
          ],
        },
        {
          type: 'category',
          label: 'Device Management',
          link: {type: 'doc', id: 'codebase/device-management/overview'},
          items: [
            'codebase/device-management/compute-pool',
            'codebase/device-management/devices',
          ],
        },
        {
          type: 'category',
          label: 'WebUI',
          link: {type: 'doc', id: 'codebase/webui/overview'},
          items: [
            'codebase/webui/backend',
            'codebase/webui/frontend',
            'codebase/webui/api',
          ],
        },
      ],
    },
  ],
};

export default sidebars;
