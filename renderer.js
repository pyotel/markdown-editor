let currentFilePath = null;
let easyMDE;

// EasyMDE 초기화
document.addEventListener('DOMContentLoaded', () => {
  easyMDE = new EasyMDE({
    element: document.getElementById('editor'),
    spellChecker: false,
    autofocus: true,
    placeholder: '# 여기에 마크다운을 작성하세요...\n\n## 기능\n\n- 실시간 미리보기\n- 파일 저장/열기\n- 마크다운 문법 도구\n\n```javascript\nconst hello = "World";\n```',
    toolbar: [
      'bold', 'italic', 'heading', '|',
      'quote', 'unordered-list', 'ordered-list', '|',
      'link', 'image', '|',
      'preview', 'side-by-side', 'fullscreen', '|',
      'guide'
    ],
    sideBySideFullscreen: false,
    status: ['lines', 'words', 'cursor']
  });
  
  updateStatus('준비됨');
});

// 상태 업데이트
function updateStatus(msg) {
  document.getElementById('status').textContent = msg;
}

function updateFilePath(path) {
  document.getElementById('file-path').textContent = path || '';
}

// 파일 열기
async function openFile() {
  const result = await window.electronAPI.openFile();
  if (result) {
    easyMDE.value(result.content);
    currentFilePath = result.path;
    updateFilePath(result.path);
    updateStatus('파일 열림');
  }
}

// 파일 저장
async function saveFile() {
  const content = easyMDE.value();
  const result = await window.electronAPI.saveFile({
    path: currentFilePath,
    content: content
  });
  
  if (result) {
    currentFilePath = result;
    updateFilePath(result);
    updateStatus('저장 완료');
  }
}

// 미리보기 토글
function togglePreview() {
  const cm = easyMDE.codemirror;
  if (easyMDE.isSideBySideActive()) {
    EasyMDE.toggleSideBySide(easyMDE);
  } else {
    EasyMDE.toggleSideBySide(easyMDE);
  }
}

// 버튼 이벤트
document.getElementById('btn-open').addEventListener('click', openFile);
document.getElementById('btn-save').addEventListener('click', saveFile);
document.getElementById('btn-preview').addEventListener('click', togglePreview);

// 메뉴 이벤트
window.electronAPI.onMenuOpen(() => openFile());
window.electronAPI.onMenuSave(() => saveFile());

// 키보드 단축키
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    saveFile();
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
    e.preventDefault();
    openFile();
  }
});
