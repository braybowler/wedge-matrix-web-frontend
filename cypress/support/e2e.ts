// Hide Vue DevTools overlay that can cover elements during E2E tests
Cypress.on('window:before:load', (win) => {
  const style = win.document.createElement('style')
  style.innerHTML = '.vue-devtools__panel { display: none !important; }'
  win.document.head.appendChild(style)
})
