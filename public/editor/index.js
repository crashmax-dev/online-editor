const app = document.querySelector('#app')
document.body.classList.add('surface')
document.body.style.margin = '0px'
Object.assign(app.style, {
  height: 'calc(100dvh - 16px)',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  padding: '8px'
})

let files = []
let activeTab = 'tab-index.js'

function renderEditor() {
  const windowInput = document.createElement('div')
  windowInput.classList.add('window')

  const windowInputTitlebar = document.createElement('div')
  windowInputTitlebar.classList.add('title-bar')
  windowInput.append(windowInputTitlebar)

  const windowInputTitlebarText = document.createElement('div')
  windowInputTitlebarText.classList.add('title-bar-text')
  windowInputTitlebarText.textContent = 'Visual Studio Code'
  windowInputTitlebar.append(windowInputTitlebarText)

  const windowInputBody = document.createElement('div')
  windowInputBody.classList.add('window-body')
  windowInput.append(windowInputBody)

  const menu = document.createElement('menu')
  menu.setAttribute('role', 'tablist')
  windowInputBody.append(menu)

  for (const file of files) {
    const tabButton = document.createElement('button')
    tabButton.addEventListener('click', (event) => {
      event.preventDefault()
      const tabs = menu.querySelectorAll('menu[role=tablist] > button')
      for (const tab of tabs) {
        if (
          tab.getAttribute('aria-controls') ===
          event.target.getAttribute('aria-controls')
        ) {
          tab.setAttribute('aria-selected', true)
          openTab(event)
        } else {
          tab.setAttribute('aria-selected', false)
        }
      }
    })

    tabButton.style.fontSize = '14px'
    tabButton.setAttribute('role', 'tab')
    const tabName = `tab-${file.name}`
    tabButton.setAttribute('aria-controls', tabName)
    tabButton.setAttribute('aria-selected', activeTab === tabName)
    tabButton.textContent = file.name
    menu.append(tabButton)

    const tabPanel = document.createElement('article')
    tabPanel.setAttribute('role', 'tabpanel')
    tabPanel.setAttribute('id', tabName)
    tabPanel.hidden = activeTab !== tabName
    windowInputBody.append(tabPanel)

    const textarea = document.createElement('textarea')
    Object.assign(textarea.style, {
      width: '100%',
      height: '40dvh',
      resize: 'vertical',
      fontSize: '16px',
      fontFamily: 'monospace',
      background: 'transparent'
    })
    textarea.value = file.source
    textarea.addEventListener('input', () => (file.source = textarea.value))
    tabPanel.append(textarea)
  }

  const fieldActions = document.createElement('section')
  fieldActions.classList.add('field-row')
  fieldActions.style.justifyContent = 'flex-end'

  const saveButton = document.createElement('button')
  saveButton.textContent = 'Save'
  saveButton.addEventListener('click', sendFiles)
  fieldActions.append(saveButton)
  windowInputBody.append(fieldActions)

  const windowOutput = document.createElement('div')
  windowOutput.classList.add('window')
  Object.assign(windowOutput.style, {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  })

  const windowTitlebar = document.createElement('div')
  windowTitlebar.classList.add('title-bar')
  windowOutput.append(windowTitlebar)

  const windowTitlebarText = document.createElement('div')
  windowTitlebarText.classList.add('title-bar-text')
  windowTitlebarText.textContent = 'Output'
  windowTitlebar.append(windowTitlebarText)

  const windowTitlebarControls = document.createElement('div')
  windowTitlebarControls.classList.add('title-bar-controls')
  const maximizeWindowButton = document.createElement('button')
  maximizeWindowButton.setAttribute('aria-label', 'Maximize')
  maximizeWindowButton.addEventListener('click', () =>
    open('/output/', 'target=_blank')
  )
  windowTitlebarControls.append(maximizeWindowButton)
  windowTitlebar.append(windowTitlebarControls)

  const windowBody = document.createElement('div')
  windowBody.id = 'window-output'
  windowBody.style.flex = '1'
  windowBody.classList.add('window-body')
  windowOutput.append(windowBody)

  const statusBar = document.createElement('div')
  statusBar.id = 'status-bar'
  windowOutput.append(statusBar)

  const iframe = renderIframe()
  windowBody.append(iframe)
  app.append(windowInput, windowOutput)
}

function renderIframe() {
  const iframe = document.createElement('iframe')
  iframe.style.width = '100%'
  iframe.setAttribute('frameborder', '0')
  iframe.src = '/output/index.html'
  return iframe
}

function renderError(data) {
  const windowOutput = document.querySelector('#window-output')
  const errorMessage = document.createElement('pre')
  Object.assign(errorMessage.style, {
    height: 'calc(100% - 8px)',
    marginRight: '-5px',
    marginTop: '-8px',
    marginLeft: '-5px'
  })
  errorMessage.textContent = data.message.replace(/\u001b\[(31|39|36|33)m/g, '')
  windowOutput.replaceChildren(errorMessage)
}

function renderOutput(data) {
  const windowOutput = document.querySelector('#window-output')
  const windowStatusBar = document.querySelector('#status-bar')
  windowStatusBar.classList.add('status-bar')
  const iframe = renderIframe()

  const modulesTransformedField = document.createElement('p')
  modulesTransformedField.classList.add('status-bar-field')
  modulesTransformedField.textContent = `${data.modulesTransformed} modules transformed`

  const bundleSizeField = document.createElement('p')
  bundleSizeField.classList.add('status-bar-field')
  bundleSizeField.textContent = `bundle size ${formatBytes(data.bundleSize)}`

  const buildTimeField = document.createElement('p')
  buildTimeField.classList.add('status-bar-field')
  buildTimeField.textContent = `built in ${data.time}ms`

  windowOutput.replaceChildren(iframe)
  windowStatusBar.replaceChildren(
    modulesTransformedField,
    bundleSizeField,
    buildTimeField
  )
}

function formatBytes(bytes) {
  const sizes = [
    'B',
    'KB',
    'MB'
  ]
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + sizes[i]
}

function openTab(event) {
  const articles = document.body.querySelectorAll('article[role="tabpanel"]')
  const targetTab = event.target.getAttribute('aria-controls')
  for (const article of articles) {
    if (article.getAttribute('iframe')) continue
    if (targetTab === article.id) {
      article.removeAttribute('hidden')
      activeTab = targetTab
    } else {
      article.setAttribute('hidden', true)
    }
  }
}

async function fetchFiles() {
  try {
    const req = await fetch('/api/files')
    const data = await req.json()
    files = data
  } catch (err) {
    console.error(err)
  }
}

async function sendFiles() {
  try {
    const req = await fetch('/api/files', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(files)
    })
    const data = await req.json()
    if (data.error) {
      renderError(data)
    } else {
      renderOutput(data)
    }
  } catch (err) {
    console.error(err)
  }
}

fetchFiles().then(renderEditor)

document.addEventListener('keydown', (event) => {
  if (event.ctrlKey && event.code === 'KeyS') {
    if (!files.length) return
    event.preventDefault()
    sendFiles()
  }
})
