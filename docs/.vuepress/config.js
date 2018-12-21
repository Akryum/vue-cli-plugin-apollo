module.exports = {
  base: '/',
  serviceWorker: true,
  head: [
    ['link', { rel: 'icon', href: '/favicon.png' }],
  ],
  locales: {
    '/': {
      lang: 'en-US',
      title: 'Vue CLI Apollo plugin',
      description: '⚡️ Integrate GraphQL in your Vue.js apps!',
    },
  },
  themeConfig: {
    repo: 'Akryum/vue-cli-plugin-apollo',
    docsDir: 'docs',
    editLinks: true,
    serviceWorker: {
      updatePopup: true,
    },
    locales: {
      '/': {
        selectText: 'Languages',
        label: 'English',
        lastUpdated: 'Last Updated',
        nav: [
          {
            text: 'Guide',
            link: '/guide/',
          },
          {
            text: 'vue-apollo',
            link: 'https://github.com/Akryum/vue-apollo',
          },
          {
            text: 'Patreon',
            link: 'https://www.patreon.com/akryum',
          },
        ],
        sidebarDepth: 3,
        sidebar: {
          '/guide/': [
            '',
            'server',
            'injected-commands',
            'env',
            'webpack',
            'manual-changes',
            {
              title: 'Advanced',
              collapsable: false,
              children: [
                'configuration',
                'client-state',
                'auth',
                'mocks',
                'directives',
                'engine',
                'express-middleware',
                'server-prod',
              ],
            },
          ],
        },
      },
    },
  },
}
